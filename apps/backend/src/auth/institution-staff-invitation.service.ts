import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@erp/db/client';
import {
    institutionStaffInvitationAcceptResponseSchema,
    institutionStaffInvitationContextResponseSchema,
    institutionStaffInvitationIssueResponseSchema,
    institutionStaffInvitationListResponseSchema,
    institutionStaffListResponseSchema,
} from '@erp/shared';
import type {
    InstitutionStaffGroupAssignmentUpdateRequest,
    InstitutionStaffInvitationAcceptRequest,
    InstitutionStaffInvitationContextResponse,
    InstitutionStaffInvitationCreateRequest,
    InstitutionStaffInvitationIssueResponse,
    InstitutionStaffInvitationListResponse,
    InstitutionStaffListResponse,
} from '@erp/shared';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../core/prisma.service';

const STAFF_INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const INVITATION_TOKEN_BYTES = 48;

@Injectable()
export class InstitutionStaffInvitationService {
    private readonly clientUrl: string;

    constructor(
        private readonly prisma: PrismaService,
        configService: ConfigService,
    ) {
        this.clientUrl = configService.getOrThrow<string>('CLIENT_URL');
    }

    async createInvitation(
        institutionId: string,
        payload: InstitutionStaffInvitationCreateRequest,
    ): Promise<InstitutionStaffInvitationIssueResponse> {
        return this.issueInvitation(institutionId, payload);
    }

    async replaceInvitation(
        institutionId: string,
        invitationId: string,
        payload: InstitutionStaffInvitationCreateRequest,
    ): Promise<InstitutionStaffInvitationIssueResponse> {
        return this.issueInvitation(institutionId, payload, invitationId);
    }

    async listInvitations(institutionId: string): Promise<InstitutionStaffInvitationListResponse> {
        const now = new Date();
        const invitations = await this.prisma.institutionStaffInvitation.findMany({
            where: { institution_id: institutionId },
            orderBy: { created_at: 'desc' },
            include: {
                pending_group_selections: {
                    where: { institution_id: institutionId },
                    select: { group_id: true },
                },
            },
        });
        return institutionStaffInvitationListResponseSchema.parse({
            invitations: invitations.map((invitation) => ({
                id: invitation.id,
                status:
                    invitation.status === 'PENDING' && invitation.expires_at <= now
                        ? 'EXPIRED'
                        : invitation.status,
                created_at: invitation.created_at.toISOString(),
                expires_at: invitation.expires_at.toISOString(),
                invited_email: invitation.normalized_email,
                accepted_at: invitation.accepted_at?.toISOString() ?? null,
                revoked_at: invitation.revoked_at?.toISOString() ?? null,
                group_ids: invitation.pending_group_selections.map(({ group_id }) => group_id),
            })),
        });
    }

    async revokeInvitation(institutionId: string, invitationId: string): Promise<void> {
        await this.prisma.$transaction(async (transaction) => {
            await this.lockInstitution(transaction, institutionId);
            const revoked = await transaction.institutionStaffInvitation.updateMany({
                where: {
                    id: invitationId,
                    institution_id: institutionId,
                    status: 'PENDING',
                    expires_at: { gt: new Date() },
                },
                data: { status: 'REVOKED', revoked_at: new Date() },
            });
            if (revoked.count !== 1) {
                throw new NotFoundException('Pending invitation not found');
            }
        });
    }

    async listStaff(institutionId: string): Promise<InstitutionStaffListResponse> {
        const staff = await this.prisma.institutionStaffMembership.findMany({
            where: { institution_id: institutionId },
            orderBy: { created_at: 'asc' },
            include: {
                account: { select: { email: true } },
                group_assignments: {
                    where: {
                        institution_id: institutionId,
                        revoked_at: null,
                        group: { institution_id: institutionId, archived_at: null },
                    },
                    select: { group_id: true },
                },
            },
        });
        return institutionStaffListResponseSchema.parse({
            staff: staff.map((membership) => ({
                account_id: membership.account_id,
                email: membership.account.email.trim().toLowerCase(),
                created_at: membership.created_at.toISOString(),
                revoked_at: membership.revoked_at?.toISOString() ?? null,
                group_ids: membership.group_assignments.map(({ group_id }) => group_id),
            })),
        });
    }

    async updateStaffGroups(
        institutionId: string,
        staffAccountId: string,
        request: InstitutionStaffGroupAssignmentUpdateRequest,
    ): Promise<void> {
        await this.prisma.$transaction(async (transaction) => {
            await this.lockInstitution(transaction, institutionId);
            const membership = await transaction.institutionStaffMembership.findFirst({
                where: {
                    account_id: staffAccountId,
                    institution_id: institutionId,
                    revoked_at: null,
                    account: { identity_kind: 'INSTITUTION_STAFF' },
                },
                select: { account_id: true },
            });
            if (!membership) {
                throw new NotFoundException('Staff membership not found');
            }

            await this.assertActiveGroups(transaction, institutionId, request.group_ids);
            const now = new Date();
            await transaction.institutionStaffGroupAssignment.updateMany({
                where: {
                    institution_id: institutionId,
                    staff_account_id: staffAccountId,
                    revoked_at: null,
                    ...(request.group_ids.length > 0
                        ? { group_id: { notIn: request.group_ids } }
                        : {}),
                },
                data: { revoked_at: now },
            });
            const active = await transaction.institutionStaffGroupAssignment.findMany({
                where: {
                    institution_id: institutionId,
                    staff_account_id: staffAccountId,
                    revoked_at: null,
                    group_id: { in: request.group_ids },
                },
                select: { group_id: true },
            });
            const existing = new Set(active.map(({ group_id }) => group_id));
            const newAssignments = request.group_ids.filter((groupId) => !existing.has(groupId));
            if (newAssignments.length > 0) {
                await transaction.institutionStaffGroupAssignment.createMany({
                    data: newAssignments.map((group_id) => ({
                        institution_id: institutionId,
                        staff_account_id: staffAccountId,
                        group_id,
                    })),
                });
            }
        });
    }

    async revokeStaff(institutionId: string, staffAccountId: string): Promise<void> {
        await this.prisma.$transaction(async (transaction) => {
            await this.lockInstitution(transaction, institutionId);
            const now = new Date();
            const revoked = await transaction.institutionStaffMembership.updateMany({
                where: {
                    account_id: staffAccountId,
                    institution_id: institutionId,
                    revoked_at: null,
                },
                data: { revoked_at: now },
            });
            if (revoked.count !== 1) {
                throw new NotFoundException('Active Staff membership not found');
            }
            await transaction.institutionStaffGroupAssignment.updateMany({
                where: {
                    institution_id: institutionId,
                    staff_account_id: staffAccountId,
                    revoked_at: null,
                },
                data: { revoked_at: now },
            });
            await transaction.session.updateMany({
                where: { account_id: staffAccountId, revoked_at: null },
                data: { revoked_at: now },
            });
        });
    }

    async getInvitationContext(token: string): Promise<InstitutionStaffInvitationContextResponse> {
        const now = new Date();
        const invitation = await this.prisma.institutionStaffInvitation.findUnique({
            where: { token_hash: this.hashToken(token) },
            include: { institution: { select: { id: true, name: true } } },
        });
        if (!invitation || invitation.status !== 'PENDING' || invitation.expires_at <= now) {
            throw this.invalidInvitation();
        }
        const groupSelections = await this.prisma.institutionStaffInvitationPendingGroup.findMany({
            where: {
                institution_id: invitation.institution_id,
                invitation_id: invitation.id,
                group: {
                    institution_id: invitation.institution_id,
                    archived_at: null,
                },
            },
            include: { group: { select: { id: true, name: true, type: true } } },
        });
        return institutionStaffInvitationContextResponseSchema.parse({
            institution_id: invitation.institution.id,
            institution_name: invitation.institution.name,
            invited_email: invitation.normalized_email,
            expires_at: invitation.expires_at.toISOString(),
            groups: groupSelections.map(({ group }) => ({
                id: group.id,
                name: group.name,
                type: group.type,
            })),
        });
    }

    async acceptInvitation(
        request: InstitutionStaffInvitationAcceptRequest,
    ): Promise<{ accepted: true }> {
        if (Buffer.byteLength(request.password, 'utf8') > 72) {
            throw this.invalidInvitation();
        }
        const tokenHash = this.hashToken(request.token);
        const candidate = await this.prisma.institutionStaffInvitation.findUnique({
            where: { token_hash: tokenHash },
            select: { id: true, institution_id: true, normalized_email: true },
        });
        if (!candidate) {
            throw this.invalidInvitation();
        }

        const normalizedEmail = candidate.normalized_email.trim().toLowerCase();
        const account = await this.prisma.account.findUnique({
            where: { email: normalizedEmail },
            include: {
                owner_grant: true,
                institution_admin_membership: true,
                institution_staff_membership: true,
            },
        });
        const comparisonHash =
            account?.password_hash ?? (await bcrypt.hash(randomBytes(24).toString('hex'), 12));
        const passwordMatches = await bcrypt.compare(request.password, comparisonHash);
        if (
            (account && !passwordMatches) ||
            (account && account.email.trim().toLowerCase() !== normalizedEmail)
        ) {
            throw this.invalidInvitation();
        }
        const newPasswordHash = account ? undefined : await bcrypt.hash(request.password, 12);

        let accepted: boolean;
        try {
            accepted = await this.prisma.$transaction(async (transaction) => {
                await this.lockInstitution(transaction, candidate.institution_id);
                const now = new Date();
                await transaction.institutionStaffInvitation.updateMany({
                    where: {
                        id: candidate.id,
                        institution_id: candidate.institution_id,
                        status: 'PENDING',
                        expires_at: { lte: now },
                    },
                    data: { status: 'EXPIRED' },
                });
                const invitation = await transaction.institutionStaffInvitation.findUnique({
                    where: { token_hash: tokenHash },
                });
                if (
                    !invitation ||
                    invitation.id !== candidate.id ||
                    invitation.status !== 'PENDING' ||
                    invitation.expires_at <= now ||
                    invitation.normalized_email.trim().toLowerCase() !== normalizedEmail
                ) {
                    return false;
                }

                const pendingGroupSelections =
                    await transaction.institutionStaffInvitationPendingGroup.findMany({
                        where: {
                            institution_id: candidate.institution_id,
                            invitation_id: invitation.id,
                            group: { institution_id: candidate.institution_id },
                        },
                        select: {
                            group_id: true,
                            group: { select: { archived_at: true } },
                        },
                    });
                if (pendingGroupSelections.some(({ group }) => group.archived_at !== null)) {
                    throw new ConflictException(
                        'One or more selected groups are archived. Ask the Institution Admin to reissue the invitation with active groups.',
                    );
                }
                const groupIds = pendingGroupSelections.map(({ group_id }) => group_id);

                let acceptedAccountId: string;
                let existingMembership: {
                    account_id: string;
                    institution_id: string;
                    revoked_at: Date | null;
                } | null = null;
                if (account) {
                    await this.lockAccount(transaction, account.id);
                    const activeAccount = await transaction.account.findUnique({
                        where: { id: account.id },
                        include: {
                            owner_grant: true,
                            institution_admin_membership: true,
                            institution_staff_membership: true,
                        },
                    });
                    if (
                        !activeAccount ||
                        activeAccount.email.trim().toLowerCase() !== normalizedEmail ||
                        activeAccount.password_hash !== account.password_hash ||
                        activeAccount.owner_grant ||
                        activeAccount.institution_admin_membership
                    ) {
                        throw this.invalidInvitation();
                    }
                    if (activeAccount.identity_kind === 'UNASSIGNED') {
                        if (activeAccount.institution_staff_membership) {
                            throw this.invalidInvitation();
                        }
                        const changed = await transaction.account.updateMany({
                            where: { id: activeAccount.id, identity_kind: 'UNASSIGNED' },
                            data: { identity_kind: 'INSTITUTION_STAFF' },
                        });
                        if (changed.count !== 1) {
                            throw this.invalidInvitation();
                        }
                    } else if (
                        activeAccount.identity_kind === 'INSTITUTION_STAFF' &&
                        activeAccount.institution_staff_membership?.account_id ===
                            activeAccount.id &&
                        activeAccount.institution_staff_membership.account_identity_kind ===
                            'INSTITUTION_STAFF' &&
                        activeAccount.institution_staff_membership?.institution_id ===
                            candidate.institution_id &&
                        activeAccount.institution_staff_membership.revoked_at
                    ) {
                        existingMembership = activeAccount.institution_staff_membership;
                        const changed = await transaction.institutionStaffMembership.updateMany({
                            where: {
                                account_id: activeAccount.id,
                                institution_id: candidate.institution_id,
                                revoked_at: { not: null },
                            },
                            data: { revoked_at: null },
                        });
                        if (changed.count !== 1) {
                            throw this.invalidInvitation();
                        }
                    } else {
                        throw this.invalidInvitation();
                    }
                    acceptedAccountId = activeAccount.id;
                } else {
                    const current = await transaction.account.findUnique({
                        where: { email: normalizedEmail },
                        select: { id: true },
                    });
                    if (current || !newPasswordHash) {
                        throw this.invalidInvitation();
                    }
                    const createdAccount = await transaction.account.create({
                        data: {
                            email: normalizedEmail,
                            password_hash: newPasswordHash,
                            identity_kind: 'INSTITUTION_STAFF',
                        },
                        select: { id: true },
                    });
                    acceptedAccountId = createdAccount.id;
                }

                if (!existingMembership) {
                    await transaction.institutionStaffMembership.create({
                        data: {
                            account_id: acceptedAccountId,
                            account_identity_kind: 'INSTITUTION_STAFF',
                            institution_id: candidate.institution_id,
                        },
                    });
                } else {
                    await transaction.institutionStaffGroupAssignment.updateMany({
                        where: {
                            institution_id: candidate.institution_id,
                            staff_account_id: acceptedAccountId,
                            revoked_at: null,
                        },
                        data: { revoked_at: now },
                    });
                }
                if (groupIds.length > 0) {
                    await transaction.institutionStaffGroupAssignment.createMany({
                        data: groupIds.map((group_id) => ({
                            institution_id: candidate.institution_id,
                            staff_account_id: acceptedAccountId,
                            group_id,
                        })),
                    });
                }
                const consumed = await transaction.institutionStaffInvitation.updateMany({
                    where: {
                        id: invitation.id,
                        token_hash: tokenHash,
                        status: 'PENDING',
                        expires_at: { gt: now },
                    },
                    data: {
                        status: 'ACCEPTED',
                        accepted_at: now,
                        accepted_by_account_id: acceptedAccountId,
                    },
                });
                if (consumed.count !== 1) {
                    throw this.invalidInvitation();
                }
                await transaction.session.updateMany({
                    where: { account_id: acceptedAccountId, revoked_at: null },
                    data: { revoked_at: now },
                });
                return true;
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                ['P2002', 'P2003', 'P2025'].includes(error.code)
            ) {
                throw this.invalidInvitation();
            }
            throw error;
        }
        if (!accepted) {
            throw this.invalidInvitation();
        }
        return institutionStaffInvitationAcceptResponseSchema.parse({ accepted: true });
    }

    private async issueInvitation(
        institutionId: string,
        request: InstitutionStaffInvitationCreateRequest,
        replaceId?: string,
    ): Promise<InstitutionStaffInvitationIssueResponse> {
        const normalizedEmail = request.invited_email.trim().toLowerCase();
        const groupIds = [...new Set(request.group_ids)];
        if (groupIds.length === 0) {
            throw new BadRequestException('Select at least one active group');
        }
        const token = randomBytes(INVITATION_TOKEN_BYTES).toString('base64url');
        const now = new Date();
        const expiresAt = new Date(now.getTime() + STAFF_INVITATION_TTL_MS);
        try {
            const invitation = await this.prisma.$transaction(async (transaction) => {
                await this.lockInstitution(transaction, institutionId);
                await transaction.institutionStaffInvitation.updateMany({
                    where: {
                        institution_id: institutionId,
                        status: 'PENDING',
                        expires_at: { lte: now },
                    },
                    data: { status: 'EXPIRED' },
                });
                if (replaceId) {
                    const oldInvitation = await transaction.institutionStaffInvitation.findFirst({
                        where: {
                            id: replaceId,
                            institution_id: institutionId,
                            status: { in: ['PENDING', 'EXPIRED'] },
                        },
                        select: { id: true },
                    });
                    if (!oldInvitation) {
                        throw new NotFoundException('Pending invitation not found');
                    }
                }

                await this.assertActiveGroups(transaction, institutionId, groupIds);
                const activeStaffMembership =
                    await transaction.institutionStaffMembership.findFirst({
                        where: {
                            institution_id: institutionId,
                            revoked_at: null,
                            account: {
                                email: normalizedEmail,
                                identity_kind: 'INSTITUTION_STAFF',
                            },
                        },
                        select: { account_id: true },
                    });
                if (activeStaffMembership) {
                    throw new ConflictException(
                        'This Staff member is already active; update group assignments instead',
                    );
                }

                await transaction.institutionStaffInvitation.updateMany({
                    where: {
                        institution_id: institutionId,
                        normalized_email: normalizedEmail,
                        status: 'PENDING',
                        ...(replaceId ? { id: { not: replaceId } } : {}),
                    },
                    data: { status: 'REVOKED', revoked_at: now },
                });
                if (replaceId) {
                    await transaction.institutionStaffInvitation.updateMany({
                        where: {
                            id: replaceId,
                            institution_id: institutionId,
                            status: 'PENDING',
                        },
                        data: { status: 'REVOKED', revoked_at: now },
                    });
                }
                const created = await transaction.institutionStaffInvitation.create({
                    data: {
                        institution_id: institutionId,
                        token_hash: this.hashToken(token),
                        normalized_email: normalizedEmail,
                        expires_at: expiresAt,
                        pending_group_selections: {
                            create: groupIds.map((group_id) => ({ group_id })),
                        },
                    },
                    include: { pending_group_selections: { select: { group_id: true } } },
                });
                return created;
            });
            return institutionStaffInvitationIssueResponseSchema.parse({
                id: invitation.id,
                status: 'PENDING',
                created_at: invitation.created_at.toISOString(),
                expires_at: invitation.expires_at.toISOString(),
                invited_email: invitation.normalized_email,
                group_ids: invitation.pending_group_selections.map(({ group_id }) => group_id),
                invitation_url: this.createInvitationUrl(token),
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                ['P2002', 'P2003', 'P2025'].includes(error.code)
            ) {
                throw new ConflictException('Invitation could not be issued');
            }
            throw error;
        }
    }

    private createInvitationUrl(token: string): string {
        const invitationUrl = new URL('/invite/staff', this.clientUrl);
        invitationUrl.hash = `token=${encodeURIComponent(token)}`;
        return invitationUrl.toString();
    }

    private async assertActiveGroups(
        transaction: Prisma.TransactionClient,
        institutionId: string,
        groupIds: string[],
    ): Promise<void> {
        if (groupIds.length === 0) {
            return;
        }
        const groups = await transaction.institutionGroup.findMany({
            where: {
                institution_id: institutionId,
                archived_at: null,
                id: { in: groupIds },
            },
            select: { id: true },
        });
        if (groups.length !== groupIds.length) {
            throw new NotFoundException('One or more active groups were not found');
        }
    }

    private async lockInstitution(
        transaction: Prisma.TransactionClient,
        institutionId: string,
    ): Promise<void> {
        const rows = await transaction.$queryRaw<Array<{ id: string }>>`
            SELECT "id" FROM "Institution" WHERE "id" = ${institutionId} FOR UPDATE
        `;
        if (rows.length !== 1) {
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
        if (rows.length !== 1) {
            throw this.invalidInvitation();
        }
    }

    private hashToken(token: string): string {
        return createHash('sha256').update(token).digest('hex');
    }

    private invalidInvitation(): UnauthorizedException {
        return new UnauthorizedException('Invitation is invalid or unavailable');
    }
}
