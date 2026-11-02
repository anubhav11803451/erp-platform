import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import type {
    InstitutionAdminInvitationCreateRequest,
    InstitutionAdminInvitationCreateResponse,
    InstitutionAdminInvitationDecision,
    InstitutionAdminInvitationDecisionResponse,
    InstitutionAdminInvitationIssueResponse,
    InstitutionAdminInvitationOwnerClaimsResponse,
    InstitutionAdminInvitationReissueRequest,
    InstitutionAdminInvitationStatusResponse,
    LegalEntityCreateRequest,
    LegalEntityCreateResponse,
    LegalEntityDirectoryResponse,
} from '@erp/shared';
import { createHash, randomBytes } from 'node:crypto';
import { Prisma } from '@erp/db/client';
import { PrismaService } from '../core/prisma.service';

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class OwnerService {
    constructor(private readonly prisma: PrismaService) {}

    async listLegalEntities(): Promise<LegalEntityDirectoryResponse> {
        const legalEntities = await this.prisma.legalEntity.findMany({
            select: {
                id: true,
                name: true,
                code: true,
                institutions: {
                    select: { id: true, name: true, code_suffix: true },
                    orderBy: { created_at: 'asc' },
                },
            },
            orderBy: { created_at: 'asc' },
        });

        return {
            legal_entities: legalEntities.map(({ id, name, code, institutions }) => ({
                id,
                name,
                code,
                institutions: institutions.map(
                    ({ id: institutionId, name: institutionName, code_suffix }) => ({
                        id: institutionId,
                        name: institutionName,
                        code: code && code_suffix ? `${code}-${code_suffix}` : null,
                    }),
                ),
            })),
        };
    }

    async createLegalEntity(payload: LegalEntityCreateRequest): Promise<LegalEntityCreateResponse> {
        const legalEntity = await this.prisma.legalEntity.create({
            data: {
                name: payload.name,
                code: payload.code,
            },
            select: { id: true, name: true, code: true },
        });
        const code = legalEntity.code;
        if (!code) {
            throw new InternalServerErrorException('LegalEntity code was not persisted');
        }
        return {
            legal_entity: { id: legalEntity.id, name: legalEntity.name, code },
        };
    }

    async createInstitutionAndIssueInvitation(
        legalEntityId: string,
        payload: InstitutionAdminInvitationCreateRequest,
        clientUrl: string,
    ): Promise<InstitutionAdminInvitationCreateResponse> {
        const invitationBearer = randomBytes(32).toString('base64url');
        const invitationTokenHash = this.hashToken(invitationBearer);
        const link = new URL('/invite/admin', clientUrl);
        link.hash = invitationBearer;

        return this.prisma.$transaction(async (transaction) => {
            const legalEntity = await transaction.legalEntity.findUnique({
                where: { id: legalEntityId },
                select: { id: true, code: true },
            });
            if (!legalEntity) {
                throw new NotFoundException('LegalEntity not found');
            }
            if (!legalEntity.code) {
                throw new ConflictException(
                    'A code is required before creating an Institution for this LegalEntity',
                );
            }

            const institution = await transaction.institution.create({
                data: {
                    legal_entity_id: legalEntity.id,
                    name: payload.name,
                    code_suffix: payload.code_suffix,
                },
                select: {
                    id: true,
                    legal_entity_id: true,
                    name: true,
                    code_suffix: true,
                },
            });
            const now = new Date();
            const expiresAt = new Date(now.getTime() + INVITATION_TTL_MS);
            const invitation = await transaction.institutionAdminInvitation.create({
                data: {
                    institution_id: institution.id,
                    token_hash: invitationTokenHash,
                    invited_email: payload.invited_email.trim().toLowerCase(),
                    owner_contact_name: payload.contact_name?.trim() || null,
                    owner_contact_phone: payload.contact_phone?.trim() || null,
                    expires_at: expiresAt,
                },
                select: { id: true, status: true, created_at: true, expires_at: true },
            });
            return {
                institution: {
                    id: institution.id,
                    legal_entity_id: institution.legal_entity_id,
                    name: institution.name,
                    code: `${legalEntity.code}-${institution.code_suffix}`,
                },
                invitation: {
                    id: invitation.id,
                    status: 'PENDING',
                    created_at: invitation.created_at.toISOString(),
                    expires_at: invitation.expires_at.toISOString(),
                    invited_email: payload.invited_email.trim().toLowerCase(),
                    one_time_invitation_url: link.toString(),
                },
            };
        });
    }

    async getFirstAdminInvitationStatus(
        institutionId: string,
    ): Promise<InstitutionAdminInvitationStatusResponse> {
        const invitation = await this.prisma.$transaction(async (transaction) => {
            await this.lockInstitution(transaction, institutionId);
            const now = new Date();
            await this.expireStaleInvitations(transaction, institutionId, now);
            return transaction.institutionAdminInvitation.findFirst({
                where: { institution_id: institutionId },
                orderBy: { created_at: 'desc' },
                include: { claimed_by_account: { select: { email: true } } },
            });
        });
        if (!invitation) {
            throw new NotFoundException('Invitation not found');
        }
        return this.toInvitationStatus(invitation);
    }

    async listPendingFirstAdminClaims(
        institutionId: string,
    ): Promise<InstitutionAdminInvitationOwnerClaimsResponse> {
        const claims = await this.prisma.$transaction(async (transaction) => {
            await this.lockInstitution(transaction, institutionId);
            const now = new Date();
            await this.expireStaleInvitations(transaction, institutionId, now);
            return transaction.institutionAdminInvitation.findMany({
                where: { institution_id: institutionId, status: 'PENDING_APPROVAL' },
                orderBy: { claimed_at: 'asc' },
                include: { claimed_by_account: { select: { email: true } } },
            });
        });

        return {
            claims: claims.map((claim) => {
                if (
                    !claim.claimed_by_account_id ||
                    !claim.claimed_by_account ||
                    !claim.claimed_at ||
                    !claim.review_expires_at ||
                    !claim.claimant_name
                ) {
                    throw new InternalServerErrorException(
                        'Pending claim is missing claimant review details',
                    );
                }
                return {
                    id: claim.id,
                    status: 'PENDING_APPROVAL' as const,
                    invited_email: claim.invited_email,
                    owner_contact_name: claim.owner_contact_name,
                    owner_contact_phone: claim.owner_contact_phone,
                    claimant_account_id: claim.claimed_by_account_id,
                    claimant_login_identifier: claim.claimed_by_account.email,
                    claimant_provided_name: claim.claimant_name,
                    claimed_at: claim.claimed_at.toISOString(),
                    review_expires_at: claim.review_expires_at.toISOString(),
                };
            }),
        };
    }

    async decideFirstAdminInvitation(
        institutionId: string,
        invitationId: string,
        ownerAccountId: string,
        decision: InstitutionAdminInvitationDecision,
    ): Promise<InstitutionAdminInvitationDecisionResponse> {
        return this.prisma.$transaction(async (transaction) => {
            await this.lockInstitution(transaction, institutionId);
            const now = new Date();
            await this.expireStaleInvitations(transaction, institutionId, now);
            const invitation = await transaction.institutionAdminInvitation.findUnique({
                where: { id: invitationId },
                include: {
                    claimed_by_account: {
                        include: {
                            owner_grant: true,
                            institution_admin_membership: true,
                        },
                    },
                },
            });
            if (!invitation || invitation.institution_id !== institutionId) {
                throw new NotFoundException('Invitation not found');
            }
            if (invitation.status === 'EXPIRED') {
                return this.toDecisionResponse({ ...invitation, status: 'EXPIRED' });
            }

            if (decision === 'REVOKE' && invitation.status === 'PENDING') {
                const changed = await transaction.institutionAdminInvitation.updateMany({
                    where: {
                        id: invitationId,
                        institution_id: institutionId,
                        status: 'PENDING',
                        expires_at: { gt: now },
                    },
                    data: {
                        status: 'REVOKED',
                        revoked_at: now,
                        decided_by_account_id: ownerAccountId,
                        decided_at: now,
                    },
                });
                if (changed.count !== 1) {
                    throw new ConflictException('Invitation cannot be revoked');
                }
                await transaction.institutionAdminInvitationContinuation.updateMany({
                    where: { invitation_id: invitationId, revoked_at: null, consumed_at: null },
                    data: { revoked_at: now },
                });
                return this.toDecisionResponse({
                    ...invitation,
                    status: 'REVOKED',
                    revoked_at: now,
                    decided_by_account_id: ownerAccountId,
                    decided_at: now,
                });
            }

            if (invitation.status !== 'PENDING_APPROVAL') {
                throw new ConflictException('Claim is no longer awaiting Owner review');
            }
            if (!invitation.claimed_by_account || !invitation.claimed_at) {
                throw new ConflictException('Claimant account is unavailable');
            }

            await this.lockAccount(transaction, invitation.claimed_by_account.id);
            const claimant = await transaction.account.findUnique({
                where: { id: invitation.claimed_by_account.id },
                include: { owner_grant: true, institution_admin_membership: true },
            });
            if (!claimant) {
                throw new ConflictException('Claimant account is unavailable');
            }

            if (decision === 'APPROVE') {
                if (
                    !invitation.invited_email ||
                    claimant.email.trim().toLowerCase() !==
                        invitation.invited_email.trim().toLowerCase()
                ) {
                    throw new ConflictException(
                        'Claimant account does not match the addressed invitation',
                    );
                }
                const existingMembership = await transaction.institutionAdminMembership.findFirst({
                    where: { institution_id: institutionId },
                    select: { account_id: true },
                });
                if (existingMembership) {
                    throw new ConflictException(
                        'An Institution Admin already exists for this Institution',
                    );
                }
                if (
                    claimant.identity_kind !== 'UNASSIGNED' ||
                    claimant.owner_grant ||
                    claimant.institution_admin_membership
                ) {
                    throw new ConflictException(
                        'Claimant is no longer eligible for this Institution',
                    );
                }
                const competingClaim = await transaction.institutionAdminInvitation.findFirst({
                    where: {
                        claimed_by_account_id: claimant.id,
                        id: { not: invitationId },
                        status: 'PENDING_APPROVAL',
                    },
                    select: { id: true },
                });
                if (competingClaim) {
                    throw new ConflictException(
                        'Claimant has another Institution Admin claim awaiting review',
                    );
                }
                const accountChanged = await transaction.account.updateMany({
                    where: { id: claimant.id, identity_kind: 'UNASSIGNED' },
                    data: { identity_kind: 'INSTITUTION_ADMIN' },
                });
                if (accountChanged.count !== 1) {
                    throw new ConflictException(
                        'Claimant is no longer eligible for this Institution',
                    );
                }
                await transaction.institutionAdminMembership.create({
                    data: {
                        account_id: claimant.id,
                        institution_id: institutionId,
                    },
                });
            } else if (
                claimant.identity_kind !== 'UNASSIGNED' ||
                claimant.owner_grant ||
                claimant.institution_admin_membership
            ) {
                throw new ConflictException('Claimant is no longer eligible for this Institution');
            }

            const nextStatus =
                decision === 'APPROVE'
                    ? 'APPROVED'
                    : decision === 'REJECT'
                      ? 'REJECTED'
                      : 'REVOKED';
            const changed = await transaction.institutionAdminInvitation.updateMany({
                where: {
                    id: invitationId,
                    institution_id: institutionId,
                    status: 'PENDING_APPROVAL',
                    review_expires_at: { gt: now },
                },
                data: {
                    status: nextStatus,
                    decided_by_account_id: ownerAccountId,
                    decided_at: now,
                    ...(decision === 'REVOKE' ? { revoked_at: now } : {}),
                },
            });
            if (changed.count !== 1) {
                throw new ConflictException('Claim is no longer awaiting Owner review');
            }
            if (decision === 'REVOKE') {
                await transaction.institutionAdminInvitationContinuation.updateMany({
                    where: { invitation_id: invitationId, revoked_at: null, consumed_at: null },
                    data: { revoked_at: now },
                });
            }
            return this.toDecisionResponse({
                ...invitation,
                status: nextStatus,
                decided_by_account_id: ownerAccountId,
                decided_at: now,
                revoked_at: decision === 'REVOKE' ? now : invitation.revoked_at,
            });
        });
    }

    async revokeFirstAdminInvitation(
        institutionId: string,
        invitationId: string,
        ownerAccountId: string,
    ): Promise<InstitutionAdminInvitationStatusResponse> {
        const result = await this.decideFirstAdminInvitation(
            institutionId,
            invitationId,
            ownerAccountId,
            'REVOKE',
        );
        const invitation = await this.prisma.institutionAdminInvitation.findUnique({
            where: { id: invitationId },
            include: { claimed_by_account: { select: { email: true } } },
        });
        if (!invitation) {
            throw new NotFoundException('Invitation not found');
        }
        return this.toInvitationStatus({ ...invitation, status: result.status });
    }

    async replaceFirstAdminInvitation(
        institutionId: string,
        invitationId: string,
        payload: InstitutionAdminInvitationReissueRequest,
        clientUrl: string,
        ownerAccountId: string,
    ): Promise<InstitutionAdminInvitationIssueResponse> {
        const bearer = randomBytes(32).toString('base64url');
        const tokenHash = this.hashToken(bearer);
        const link = new URL('/invite/admin', clientUrl);
        link.hash = bearer;
        const invitation = await this.prisma.$transaction(async (transaction) => {
            await this.lockInstitution(transaction, institutionId);
            const now = new Date();
            const expiresAt = new Date(now.getTime() + INVITATION_TTL_MS);
            await this.expireStaleInvitations(transaction, institutionId, now);
            await this.assertNoPreviousGrant(transaction, institutionId);
            const previous = await transaction.institutionAdminInvitation.findUnique({
                where: { id: invitationId },
                select: {
                    id: true,
                    institution_id: true,
                    status: true,
                    expires_at: true,
                    invited_email: true,
                },
            });
            if (!previous || previous.institution_id !== institutionId) {
                throw new NotFoundException('Invitation not found');
            }
            if (previous.status === 'PENDING' && previous.expires_at > now) {
                const revoked = await transaction.institutionAdminInvitation.updateMany({
                    where: {
                        id: invitationId,
                        institution_id: institutionId,
                        status: 'PENDING',
                        expires_at: { gt: now },
                    },
                    data: {
                        status: 'REVOKED',
                        revoked_at: now,
                        decided_by_account_id: ownerAccountId,
                        decided_at: now,
                    },
                });
                if (revoked.count !== 1) {
                    throw new ConflictException('Invitation cannot be replaced');
                }
                await transaction.institutionAdminInvitationContinuation.updateMany({
                    where: {
                        invitation_id: invitationId,
                        revoked_at: null,
                        consumed_at: null,
                    },
                    data: { revoked_at: now },
                });
            } else if (previous.status === 'PENDING_APPROVAL') {
                if (previous.invited_email !== null) {
                    throw new ConflictException('A submitted claim must be decided before reissue');
                }
                const revoked = await transaction.institutionAdminInvitation.updateMany({
                    where: {
                        id: invitationId,
                        institution_id: institutionId,
                        status: 'PENDING_APPROVAL',
                        review_expires_at: { gt: now },
                    },
                    data: {
                        status: 'REVOKED',
                        revoked_at: now,
                        decided_by_account_id: ownerAccountId,
                        decided_at: now,
                    },
                });
                if (revoked.count !== 1) {
                    throw new ConflictException('Legacy claim cannot be replaced');
                }
                await transaction.institutionAdminInvitationContinuation.updateMany({
                    where: {
                        invitation_id: invitationId,
                        revoked_at: null,
                        consumed_at: null,
                    },
                    data: { revoked_at: now },
                });
            }
            await this.assertNoOutstandingInvitation(transaction, institutionId);
            return transaction.institutionAdminInvitation.create({
                data: {
                    institution_id: institutionId,
                    token_hash: tokenHash,
                    invited_email: payload.invited_email.trim().toLowerCase(),
                    owner_contact_name: payload.contact_name?.trim() || null,
                    owner_contact_phone: payload.contact_phone?.trim() || null,
                    expires_at: expiresAt,
                },
                select: { id: true, status: true, created_at: true, expires_at: true },
            });
        });
        return {
            id: invitation.id,
            status: 'PENDING',
            created_at: invitation.created_at.toISOString(),
            expires_at: invitation.expires_at.toISOString(),
            invited_email: payload.invited_email.trim().toLowerCase(),
            one_time_invitation_url: link.toString(),
        };
    }

    private async lockInstitution(
        transaction: Prisma.TransactionClient,
        institutionId: string,
    ): Promise<void> {
        const rows = await transaction.$queryRaw<Array<{ id: string }>>`
            SELECT "id" FROM "Institution" WHERE "id" = ${institutionId} FOR UPDATE
        `;
        if (rows.length === 0) {
            throw new NotFoundException('Institution not found');
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
            throw new ConflictException('Claimant account is unavailable');
        }
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

    private async assertNoOutstandingInvitation(
        transaction: Prisma.TransactionClient,
        institutionId: string,
    ): Promise<void> {
        const pending = await transaction.institutionAdminInvitation.findFirst({
            where: {
                institution_id: institutionId,
                status: { in: ['PENDING', 'PENDING_APPROVAL'] },
            },
            select: { id: true },
        });
        if (pending) {
            throw new ConflictException('An invitation or claim is already outstanding');
        }
    }

    private async assertNoPreviousGrant(
        transaction: Prisma.TransactionClient,
        institutionId: string,
    ): Promise<void> {
        const [priorApproved, membership] = await Promise.all([
            transaction.institutionAdminInvitation.findFirst({
                where: {
                    institution_id: institutionId,
                    status: { in: ['APPROVED', 'LEGACY_ACCEPTED'] },
                },
                select: { id: true },
            }),
            transaction.institutionAdminMembership.findFirst({
                where: { institution_id: institutionId },
                select: { account_id: true },
            }),
        ]);
        if (priorApproved || membership) {
            throw new ConflictException('An Institution Admin already exists for this Institution');
        }
    }

    private toInvitationStatus(invitation: {
        id: string;
        status: InstitutionAdminInvitationStatusResponse['status'];
        created_at: Date;
        expires_at: Date;
        invited_email: string | null;
        owner_contact_name: string | null;
        owner_contact_phone: string | null;
        accepted_at: Date | null;
        revoked_at: Date | null;
        claimed_at: Date | null;
        claimed_by_account_id: string | null;
        claimed_by_account: { email: string } | null;
        claimant_name: string | null;
        review_expires_at: Date | null;
        decided_at: Date | null;
        decided_by_account_id: string | null;
    }): InstitutionAdminInvitationStatusResponse {
        return {
            id: invitation.id,
            status: invitation.status,
            created_at: invitation.created_at.toISOString(),
            expires_at: invitation.expires_at.toISOString(),
            invited_email: invitation.invited_email,
            owner_contact_name: invitation.owner_contact_name,
            owner_contact_phone: invitation.owner_contact_phone,
            accepted_at: invitation.accepted_at?.toISOString() ?? null,
            revoked_at: invitation.revoked_at?.toISOString() ?? null,
            claimed_at: invitation.claimed_at?.toISOString() ?? null,
            claimed_by_account_id: invitation.claimed_by_account_id,
            claimant_login_identifier: invitation.claimed_by_account?.email ?? null,
            claimant_provided_name: invitation.claimant_name,
            review_expires_at: invitation.review_expires_at?.toISOString() ?? null,
            decided_at: invitation.decided_at?.toISOString() ?? null,
            decided_by_account_id: invitation.decided_by_account_id,
        };
    }

    private toDecisionResponse(invitation: {
        id: string;
        status: 'APPROVED' | 'REJECTED' | 'REVOKED' | 'EXPIRED';
        claimed_at: Date | null;
        review_expires_at: Date | null;
        decided_at: Date | null;
        decided_by_account_id: string | null;
        revoked_at: Date | null;
    }): InstitutionAdminInvitationDecisionResponse {
        return {
            id: invitation.id,
            status: invitation.status,
            claimed_at: invitation.claimed_at?.toISOString() ?? null,
            review_expires_at: invitation.review_expires_at?.toISOString() ?? null,
            decided_at: invitation.decided_at?.toISOString() ?? null,
            decided_by_account_id: invitation.decided_by_account_id,
            revoked_at: invitation.revoked_at?.toISOString() ?? null,
        };
    }

    private hashToken(token: string): string {
        return createHash('sha256').update(token).digest('hex');
    }
}
