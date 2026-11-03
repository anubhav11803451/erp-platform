import {
    ForbiddenException,
    Injectable,
    ServiceUnavailableException,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@erp/db/client';
import type {
    InstitutionAdminInvitationAccountCredentials,
    InstitutionAdminInvitationClaimRequest,
    InstitutionAdminInvitationClaimResponse,
    InstitutionAdminInvitationClaimantStatusResponse,
    InstitutionAdminInvitationExchangeResponse,
    InstitutionAdminInvitationNewAccountClaim,
} from '@erp/shared';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import type { Response } from 'express';
import { PrismaService } from '../core/prisma.service';

const REVIEW_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const CONTINUATION_COOKIE_PATH = '/v1/api/auth';
const CONTINUATION_CSRF_COOKIE_PATH = '/v1/api/auth';
const LEGACY_CONTINUATION_COOKIE_PATH = '/v1/api/auth/invitations';
const STATUS_COOKIE_PATH = '/v1/api/auth/invitations/status';

type ClaimTransactionResult =
    | { expired: true }
    | {
          expired: false;
          id: string;
          invitedEmail: string;
          claimedAt: Date;
          reviewExpiresAt: Date;
      };

@Injectable()
export class InstitutionAdminInvitationService {
    private readonly continuationCookieName: string;
    private readonly continuationCsrfCookieName: string;
    private readonly statusCookieName: string;
    private readonly isProduction: boolean;
    private readonly productionCookieSettingsReady: boolean;
    private readonly sameSite: 'lax' | 'strict' | 'none';

    constructor(
        private readonly prisma: PrismaService,
        configService: ConfigService,
    ) {
        this.continuationCookieName =
            configService.get<string>('INSTITUTION_ADMIN_CONTINUATION_COOKIE_NAME') || 'erp360_iac';
        this.continuationCsrfCookieName =
            configService.get<string>('INSTITUTION_ADMIN_CONTINUATION_CSRF_COOKIE_NAME') ||
            'erp360_iac_ctk';
        this.statusCookieName =
            configService.get<string>('INSTITUTION_ADMIN_STATUS_COOKIE_NAME') || 'erp360_ias';
        this.isProduction = configService.get<string>('NODE_ENV') === 'production';
        const configuredSameSite = configService.get<string>('INSTITUTION_ADMIN_COOKIE_SAME_SITE');
        this.productionCookieSettingsReady =
            !this.isProduction || ['lax', 'strict', 'none'].includes(configuredSameSite ?? '');
        this.sameSite =
            configuredSameSite === 'strict' || configuredSameSite === 'none'
                ? configuredSameSite
                : 'lax';
    }

    async exchange(
        bearerToken: string,
        response: Response,
    ): Promise<InstitutionAdminInvitationExchangeResponse> {
        this.assertCookieTopologyConfigured();
        const invitationHash = this.hashToken(bearerToken);
        const candidate = await this.prisma.institutionAdminInvitation.findUnique({
            where: { token_hash: invitationHash },
            select: { id: true, institution_id: true },
        });
        if (!candidate) {
            throw this.invalidInvitation();
        }

        const continuationToken = this.createOpaqueToken();
        const csrfToken = this.createOpaqueToken();
        const result = await this.prisma.$transaction(async (transaction) => {
            await this.lockInstitution(transaction, candidate.institution_id);
            const now = new Date();
            await this.expireStaleInvitations(transaction, candidate.institution_id, now);
            const invitation = await transaction.institutionAdminInvitation.findUnique({
                where: { token_hash: invitationHash },
                include: {
                    institution: {
                        include: { legal_entity: { select: { code: true } } },
                    },
                },
            });
            if (
                !invitation ||
                invitation.id !== candidate.id ||
                invitation.status !== 'PENDING' ||
                invitation.expires_at <= now ||
                !invitation.invited_email
            ) {
                return { expired: true as const };
            }

            const expiresAt = new Date(
                Math.min(now.getTime() + 15 * 60 * 1000, invitation.expires_at.getTime()),
            );
            await transaction.institutionAdminInvitationContinuation.create({
                data: {
                    invitation_id: invitation.id,
                    credential_hash: this.hashToken(continuationToken),
                    csrf_token_hash: this.hashToken(csrfToken),
                    expires_at: expiresAt,
                },
            });
            return {
                expired: false as const,
                institution: this.toInstitutionContext(invitation.institution),
                invitedEmail: invitation.invited_email,
                invitationExpiresAt: invitation.expires_at,
                continuationExpiresAt: expiresAt,
            };
        });

        if (result.expired) {
            throw this.invalidInvitation();
        }
        this.setContinuationCookie(response, continuationToken, result.continuationExpiresAt);
        this.setContinuationCsrfCookie(response, csrfToken, result.continuationExpiresAt);
        return {
            institution: result.institution,
            invited_email: result.invitedEmail,
            invitation_expires_at: result.invitationExpiresAt.toISOString(),
            csrf_token: csrfToken,
        };
    }

    async resume(
        continuationToken: string | undefined,
        response: Response,
    ): Promise<InstitutionAdminInvitationExchangeResponse> {
        this.assertCookieTopologyConfigured();
        if (!continuationToken) {
            throw this.invalidInvitation();
        }
        const credentialHash = this.hashToken(continuationToken);
        const candidate = await this.prisma.institutionAdminInvitationContinuation.findUnique({
            where: { credential_hash: credentialHash },
            select: { id: true, invitation: { select: { institution_id: true } } },
        });
        if (!candidate) {
            throw this.invalidInvitation();
        }

        const csrfToken = this.createOpaqueToken();
        const result = await this.prisma.$transaction(async (transaction) => {
            await this.lockInstitution(transaction, candidate.invitation.institution_id);
            const now = new Date();
            await this.expireStaleInvitations(
                transaction,
                candidate.invitation.institution_id,
                now,
            );
            const continuation = await this.findContinuation(transaction, credentialHash);
            if (!this.isActiveContinuation(continuation, now)) {
                return { expired: true as const };
            }
            const changed = await transaction.institutionAdminInvitationContinuation.updateMany({
                where: {
                    id: continuation.id,
                    credential_hash: credentialHash,
                    revoked_at: null,
                    consumed_at: null,
                    expires_at: { gt: now },
                },
                data: { csrf_token_hash: this.hashToken(csrfToken) },
            });
            if (changed.count !== 1) {
                return { expired: true as const };
            }
            return {
                expired: false as const,
                institution: this.toInstitutionContext(continuation.invitation.institution),
                invitedEmail: continuation.invitation.invited_email!,
                invitationExpiresAt: continuation.invitation.expires_at,
                continuationExpiresAt: continuation.expires_at,
            };
        });
        if (result.expired) {
            this.clearContinuationCookie(response);
            this.clearContinuationCsrfCookie(response);
            throw this.invalidInvitation();
        }

        this.setContinuationCookie(response, continuationToken, result.continuationExpiresAt);
        this.setContinuationCsrfCookie(response, csrfToken, result.continuationExpiresAt);
        return {
            institution: result.institution,
            invited_email: result.invitedEmail,
            invitation_expires_at: result.invitationExpiresAt.toISOString(),
            csrf_token: csrfToken,
        };
    }

    async signInExistingAccount(
        continuationToken: string | undefined,
        credentials: InstitutionAdminInvitationAccountCredentials,
        csrfToken: string,
        response: Response,
    ): Promise<InstitutionAdminInvitationExchangeResponse> {
        this.assertCookieTopologyConfigured();
        if (!continuationToken) {
            throw this.invalidInvitation();
        }
        const oldHash = this.hashToken(continuationToken);
        const candidate = await this.prisma.institutionAdminInvitationContinuation.findUnique({
            where: { credential_hash: oldHash },
            select: {
                id: true,
                csrf_token_hash: true,
                invitation: { select: { institution_id: true, invited_email: true } },
            },
        });
        if (!candidate) {
            throw this.invalidCredentialsOrInvitation();
        }
        if (!this.matchesHash(csrfToken, candidate.csrf_token_hash)) {
            throw new ForbiddenException('CSRF validation failed');
        }

        const normalizedEmail = credentials.email.trim().toLowerCase();
        if (
            !candidate.invitation.invited_email ||
            candidate.invitation.invited_email.trim().toLowerCase() !== normalizedEmail
        ) {
            throw this.invalidCredentialsOrInvitation();
        }
        const account = await this.prisma.account.findUnique({
            where: { email: normalizedEmail },
            include: { owner_grant: true, institution_admin_membership: true },
        });
        const comparisonHash =
            account?.password_hash ?? (await bcrypt.hash(randomBytes(24).toString('hex'), 12));
        const passwordMatches = await bcrypt.compare(credentials.password, comparisonHash);
        if (
            !account ||
            !passwordMatches ||
            account.email.trim().toLowerCase() !== normalizedEmail ||
            account.identity_kind !== 'UNASSIGNED' ||
            account.owner_grant ||
            account.institution_admin_membership
        ) {
            throw this.invalidCredentialsOrInvitation();
        }

        const nextToken = this.createOpaqueToken();
        const nextCsrf = this.createOpaqueToken();
        const result = await this.prisma.$transaction(async (transaction) => {
            await this.lockInstitution(transaction, candidate.invitation.institution_id);
            const now = new Date();
            await this.expireStaleInvitations(
                transaction,
                candidate.invitation.institution_id,
                now,
            );
            const continuation = await this.findContinuation(transaction, oldHash);
            if (!this.isActiveContinuation(continuation, now)) {
                return { expired: true as const };
            }
            if (!this.matchesHash(csrfToken, continuation.csrf_token_hash)) {
                throw new ForbiddenException('CSRF validation failed');
            }
            if (continuation.account_id && continuation.account_id !== account.id) {
                throw this.invalidCredentialsOrInvitation();
            }
            if (
                !continuation.invitation.invited_email ||
                continuation.invitation.invited_email.trim().toLowerCase() !== normalizedEmail
            ) {
                throw this.invalidCredentialsOrInvitation();
            }

            await this.lockAccount(transaction, account.id);
            const activeAccount = await transaction.account.findUnique({
                where: { id: account.id },
                include: { owner_grant: true, institution_admin_membership: true },
            });
            if (
                !activeAccount ||
                activeAccount.email.trim().toLowerCase() !== normalizedEmail ||
                activeAccount.identity_kind !== 'UNASSIGNED' ||
                activeAccount.owner_grant ||
                activeAccount.institution_admin_membership ||
                activeAccount.password_hash !== account.password_hash
            ) {
                throw this.invalidCredentialsOrInvitation();
            }

            const changed = await transaction.institutionAdminInvitationContinuation.updateMany({
                where: {
                    id: continuation.id,
                    credential_hash: oldHash,
                    revoked_at: null,
                    consumed_at: null,
                    expires_at: { gt: now },
                },
                data: {
                    credential_hash: this.hashToken(nextToken),
                    account_id: account.id,
                    csrf_token_hash: this.hashToken(nextCsrf),
                },
            });
            if (changed.count !== 1) {
                throw this.invalidCredentialsOrInvitation();
            }
            return {
                expired: false as const,
                institution: this.toInstitutionContext(continuation.invitation.institution),
                invitedEmail: continuation.invitation.invited_email!,
                invitationExpiresAt: continuation.invitation.expires_at,
                continuationExpiresAt: continuation.expires_at,
            };
        });
        if (result.expired) {
            this.clearContinuationCookie(response);
            this.clearContinuationCsrfCookie(response);
            throw this.invalidInvitation();
        }

        this.setContinuationCookie(response, nextToken, result.continuationExpiresAt);
        this.setContinuationCsrfCookie(response, nextCsrf, result.continuationExpiresAt);
        return {
            institution: result.institution,
            invited_email: result.invitedEmail,
            invitation_expires_at: result.invitationExpiresAt.toISOString(),
            csrf_token: nextCsrf,
        };
    }

    async claimExistingAccount(
        continuationToken: string | undefined,
        claim: InstitutionAdminInvitationClaimRequest,
        csrfToken: string,
        response: Response,
    ): Promise<InstitutionAdminInvitationClaimResponse> {
        return this.claim(continuationToken, claim.claimant_provided_name, csrfToken, response);
    }

    async claimNewAccount(
        continuationToken: string | undefined,
        claim: InstitutionAdminInvitationNewAccountClaim,
        csrfToken: string,
        response: Response,
    ): Promise<InstitutionAdminInvitationClaimResponse> {
        const account = { passwordHash: await bcrypt.hash(claim.password, 12) };
        return this.claim(
            continuationToken,
            claim.claimant_provided_name,
            csrfToken,
            response,
            account,
        );
    }

    async getClaimantStatus(
        statusCredential: string | undefined,
    ): Promise<InstitutionAdminInvitationClaimantStatusResponse> {
        if (!statusCredential) {
            throw this.invalidInvitation();
        }
        const credentialHash = this.hashToken(statusCredential);
        const candidate = await this.prisma.institutionAdminInvitation.findUnique({
            where: { status_credential_hash: credentialHash },
            select: { id: true, institution_id: true },
        });
        if (!candidate) {
            throw this.invalidInvitation();
        }

        const result = await this.prisma.$transaction(async (transaction) => {
            await this.lockInstitution(transaction, candidate.institution_id);
            const now = new Date();
            await this.expireStaleInvitations(transaction, candidate.institution_id, now);
            const invitation = await transaction.institutionAdminInvitation.findUnique({
                where: { id: candidate.id },
                select: {
                    status: true,
                    invited_email: true,
                    claimed_at: true,
                    review_expires_at: true,
                    decided_at: true,
                    status_credential_expires_at: true,
                },
            });
            if (
                !invitation ||
                !invitation.invited_email ||
                !invitation.claimed_at ||
                !invitation.review_expires_at ||
                !invitation.status_credential_expires_at ||
                invitation.status_credential_expires_at <= now
            ) {
                return null;
            }
            if (
                !['PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'REVOKED', 'EXPIRED'].includes(
                    invitation.status,
                )
            ) {
                return null;
            }
            return invitation;
        });
        if (!result) {
            throw this.invalidInvitation();
        }
        return {
            status: result.status as InstitutionAdminInvitationClaimantStatusResponse['status'],
            invited_email: result.invited_email!,
            claimed_at: result.claimed_at!.toISOString(),
            review_expires_at: result.review_expires_at!.toISOString(),
            decided_at: result.decided_at?.toISOString() ?? null,
        };
    }

    async logoutContinuation(
        continuationToken: string | undefined,
        csrfToken: string,
        response: Response,
    ): Promise<void> {
        if (continuationToken) {
            const hash = this.hashToken(continuationToken);
            const continuation =
                await this.prisma.institutionAdminInvitationContinuation.findUnique({
                    where: { credential_hash: hash },
                    select: { id: true, csrf_token_hash: true },
                });
            if (continuation && !this.matchesHash(csrfToken, continuation.csrf_token_hash)) {
                throw new ForbiddenException('CSRF validation failed');
            }
            if (continuation) {
                await this.prisma.institutionAdminInvitationContinuation.updateMany({
                    where: {
                        id: continuation.id,
                        revoked_at: null,
                        consumed_at: null,
                    },
                    data: { revoked_at: new Date() },
                });
            }
        }
        this.clearContinuationCookie(response);
        this.clearContinuationCsrfCookie(response);
        this.clearStatusCookie(response);
    }

    private async claim(
        continuationToken: string | undefined,
        claimantName: string,
        csrfToken: string,
        response: Response,
        newAccount?: { passwordHash: string },
    ): Promise<InstitutionAdminInvitationClaimResponse> {
        this.assertCookieTopologyConfigured();
        if (!continuationToken) {
            throw this.invalidInvitation();
        }
        const credentialHash = this.hashToken(continuationToken);
        const candidate = await this.prisma.institutionAdminInvitationContinuation.findUnique({
            where: { credential_hash: credentialHash },
            select: {
                id: true,
                csrf_token_hash: true,
                invitation: { select: { institution_id: true, invited_email: true } },
            },
        });
        if (!candidate) {
            throw this.invalidInvitation();
        }
        if (!this.matchesHash(csrfToken, candidate.csrf_token_hash)) {
            throw new ForbiddenException('CSRF validation failed');
        }

        const statusCredential = this.createOpaqueToken();
        let result: ClaimTransactionResult;
        try {
            result = await this.prisma.$transaction(async (transaction) => {
                await this.lockInstitution(transaction, candidate.invitation.institution_id);
                const now = new Date();
                const reviewExpiresAt = new Date(now.getTime() + REVIEW_TTL_MS);
                await this.expireStaleInvitations(
                    transaction,
                    candidate.invitation.institution_id,
                    now,
                );
                const continuation = await this.findContinuation(transaction, credentialHash);
                if (!this.isActiveContinuation(continuation, now)) {
                    return { expired: true };
                }
                if (!this.matchesHash(csrfToken, continuation.csrf_token_hash)) {
                    throw new ForbiddenException('CSRF validation failed');
                }
                const invitation = continuation.invitation;
                if (
                    invitation.status !== 'PENDING' ||
                    invitation.expires_at <= now ||
                    !invitation.invited_email
                ) {
                    return { expired: true };
                }
                const existingMembership = await transaction.institutionAdminMembership.findFirst({
                    where: { institution_id: invitation.institution_id },
                    select: { account_id: true },
                });
                if (existingMembership) {
                    throw this.invalidInvitation();
                }

                let accountId: string;
                if (newAccount) {
                    if (continuation.account_id) {
                        throw this.invalidCredentialsOrInvitation();
                    }
                    const existing = await transaction.account.findUnique({
                        where: { email: invitation.invited_email },
                        select: { id: true },
                    });
                    if (existing) {
                        throw this.invalidCredentialsOrInvitation();
                    }
                    const account = await transaction.account.create({
                        data: {
                            email: invitation.invited_email,
                            password_hash: newAccount.passwordHash,
                            identity_kind: 'UNASSIGNED',
                        },
                        select: { id: true },
                    });
                    accountId = account.id;
                } else {
                    if (!continuation.account_id) {
                        throw this.invalidCredentialsOrInvitation();
                    }
                    await this.lockAccount(transaction, continuation.account_id);
                    const account = await transaction.account.findUnique({
                        where: { id: continuation.account_id },
                        include: { owner_grant: true, institution_admin_membership: true },
                    });
                    if (
                        !account ||
                        account.email.trim().toLowerCase() !==
                            invitation.invited_email.trim().toLowerCase() ||
                        account.identity_kind !== 'UNASSIGNED' ||
                        account.owner_grant ||
                        account.institution_admin_membership
                    ) {
                        throw this.invalidCredentialsOrInvitation();
                    }
                    accountId = account.id;
                }

                const otherPendingClaim = await transaction.institutionAdminInvitation.findFirst({
                    where: {
                        claimed_by_account_id: accountId,
                        status: 'PENDING_APPROVAL',
                    },
                    select: { id: true },
                });
                if (otherPendingClaim) {
                    throw this.invalidCredentialsOrInvitation();
                }

                const changed = await transaction.institutionAdminInvitation.updateMany({
                    where: {
                        id: invitation.id,
                        status: 'PENDING',
                        expires_at: { gt: now },
                    },
                    data: {
                        status: 'PENDING_APPROVAL',
                        claimed_by_account_id: accountId,
                        claimed_at: now,
                        claimant_name: claimantName.trim(),
                        review_expires_at: reviewExpiresAt,
                        status_credential_hash: this.hashToken(statusCredential),
                        status_credential_expires_at: reviewExpiresAt,
                    },
                });
                if (changed.count !== 1) {
                    throw this.invalidInvitation();
                }
                await transaction.institutionAdminInvitationContinuation.deleteMany({
                    where: { id: continuation.id },
                });
                return {
                    expired: false,
                    id: invitation.id,
                    invitedEmail: invitation.invited_email,
                    claimedAt: now,
                    reviewExpiresAt,
                };
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                ['P2002', 'P2003', 'P2025'].includes(error.code)
            ) {
                throw this.invalidCredentialsOrInvitation();
            }
            throw error;
        }

        if (result.expired) {
            this.clearContinuationCookie(response);
            this.clearContinuationCsrfCookie(response);
            throw this.invalidInvitation();
        }
        this.clearContinuationCookie(response);
        this.clearContinuationCsrfCookie(response);
        this.setStatusCookie(response, statusCredential, result.reviewExpiresAt);
        return {
            id: result.id,
            status: 'PENDING_APPROVAL',
            invited_email: result.invitedEmail,
            claimed_at: result.claimedAt.toISOString(),
            review_expires_at: result.reviewExpiresAt.toISOString(),
        };
    }

    private async findContinuation(transaction: Prisma.TransactionClient, credentialHash: string) {
        return transaction.institutionAdminInvitationContinuation.findUnique({
            where: { credential_hash: credentialHash },
            include: {
                invitation: {
                    include: {
                        institution: {
                            include: { legal_entity: { select: { code: true } } },
                        },
                    },
                },
            },
        });
    }

    private isActiveContinuation(
        continuation: Awaited<ReturnType<typeof this.findContinuation>>,
        now: Date,
    ): continuation is NonNullable<Awaited<ReturnType<typeof this.findContinuation>>> {
        return (
            !!continuation &&
            !continuation.revoked_at &&
            !continuation.consumed_at &&
            continuation.expires_at > now &&
            continuation.invitation.status === 'PENDING' &&
            !!continuation.invitation.invited_email &&
            continuation.invitation.expires_at > now
        );
    }

    private async expireStaleInvitations(
        transaction: Prisma.TransactionClient,
        institutionId: string,
        now: Date,
    ): Promise<void> {
        await transaction.institutionAdminInvitation.updateMany({
            where: {
                institution_id: institutionId,
                OR: [
                    { status: 'PENDING', expires_at: { lte: now } },
                    { status: 'PENDING_APPROVAL', review_expires_at: { lte: now } },
                ],
            },
            data: { status: 'EXPIRED' },
        });
    }

    private async lockInstitution(
        transaction: Prisma.TransactionClient,
        institutionId: string,
    ): Promise<void> {
        const rows = await transaction.$queryRaw<Array<{ id: string }>>`
            SELECT "id" FROM "Institution" WHERE "id" = ${institutionId} FOR UPDATE
        `;
        if (rows.length === 0) {
            throw this.invalidInvitation();
        }
    }

    private async lockAccount(
        transaction: Prisma.TransactionClient,
        accountId: string,
    ): Promise<void> {
        const rows = await transaction.$queryRaw<Array<{ id: string }>>`
            SELECT "id" FROM "Account" WHERE "id" = ${accountId} FOR UPDATE
        `;
        if (rows.length === 0) {
            throw this.invalidCredentialsOrInvitation();
        }
    }

    private setContinuationCookie(response: Response, token: string, expiresAt: Date): void {
        response.clearCookie(this.continuationCookieName, {
            httpOnly: true,
            secure: this.cookieIsSecure(response),
            sameSite: this.sameSite,
            path: LEGACY_CONTINUATION_COOKIE_PATH,
        });
        response.cookie(this.continuationCookieName, token, {
            httpOnly: true,
            secure: this.cookieIsSecure(response),
            sameSite: this.sameSite,
            path: CONTINUATION_COOKIE_PATH,
            expires: expiresAt,
        });
    }

    private setStatusCookie(response: Response, token: string, expiresAt: Date): void {
        response.cookie(this.statusCookieName, token, {
            httpOnly: true,
            secure: this.isProduction,
            sameSite: 'strict',
            path: STATUS_COOKIE_PATH,
            expires: expiresAt,
        });
    }

    private setContinuationCsrfCookie(response: Response, token: string, expiresAt: Date): void {
        response.clearCookie(this.continuationCsrfCookieName, {
            httpOnly: false,
            secure: this.cookieIsSecure(response),
            sameSite: this.sameSite,
            path: '/',
        });
        response.cookie(this.continuationCsrfCookieName, token, {
            httpOnly: true,
            secure: this.cookieIsSecure(response),
            sameSite: this.sameSite,
            path: CONTINUATION_CSRF_COOKIE_PATH,
            expires: expiresAt,
        });
    }

    private clearContinuationCookie(response: Response): void {
        for (const path of [CONTINUATION_COOKIE_PATH, LEGACY_CONTINUATION_COOKIE_PATH]) {
            response.clearCookie(this.continuationCookieName, {
                httpOnly: true,
                secure: this.cookieIsSecure(response),
                sameSite: this.sameSite,
                path,
            });
        }
    }

    private clearContinuationCsrfCookie(response: Response): void {
        for (const [path, httpOnly] of [
            ['/', false],
            [CONTINUATION_CSRF_COOKIE_PATH, true],
        ] as const) {
            response.clearCookie(this.continuationCsrfCookieName, {
                httpOnly,
                secure: this.cookieIsSecure(response),
                sameSite: this.sameSite,
                path,
            });
        }
    }

    private clearStatusCookie(response: Response): void {
        response.clearCookie(this.statusCookieName, {
            httpOnly: true,
            secure: this.isProduction,
            sameSite: 'strict',
            path: STATUS_COOKIE_PATH,
        });
    }

    private createOpaqueToken(): string {
        return randomBytes(64).toString('base64url');
    }

    private cookieIsSecure(response: Response): boolean {
        const secure = this.isProduction || response.req?.secure === true;
        if (this.sameSite === 'none' && !secure) {
            throw new Error('SameSite=None requires secure Institution Admin cookies');
        }
        return secure;
    }

    private assertCookieTopologyConfigured(): void {
        if (!this.productionCookieSettingsReady) {
            throw new ServiceUnavailableException(
                'Invitation cookie settings require production topology review',
            );
        }
    }

    private hashToken(token: string): string {
        return createHash('sha256').update(token).digest('hex');
    }

    private toInstitutionContext(institution: {
        id: string;
        name: string;
        code_suffix: string | null;
        legal_entity: { code: string | null };
    }) {
        const code =
            institution.legal_entity.code && institution.code_suffix
                ? `${institution.legal_entity.code}-${institution.code_suffix}`
                : null;
        return { id: institution.id, name: institution.name, code };
    }

    private matchesHash(token: string, expectedHash: string): boolean {
        if (!expectedHash) {
            return false;
        }
        const actual = Buffer.from(this.hashToken(token));
        const expected = Buffer.from(expectedHash);
        return actual.length === expected.length && timingSafeEqual(actual, expected);
    }

    private invalidInvitation(): UnauthorizedException {
        return new UnauthorizedException('Invitation is invalid or unavailable');
    }

    private invalidCredentialsOrInvitation(): UnauthorizedException {
        return new UnauthorizedException('Unable to continue with this invitation');
    }
}
