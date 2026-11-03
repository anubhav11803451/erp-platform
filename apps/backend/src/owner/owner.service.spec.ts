import { ConflictException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { PrismaService } from '../core/prisma.service';
import { OwnerService } from './owner.service';

const legalEntityId = '00000000-0000-4000-8000-000000000001';
const institutionId = '00000000-0000-4000-8000-000000000002';
const invitationId = '00000000-0000-4000-8000-000000000003';
const claimantId = '00000000-0000-4000-8000-000000000004';
const ownerId = '00000000-0000-4000-8000-000000000005';
const now = new Date('2026-10-29T12:00:00.000Z');
const reviewDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000);

describe('OwnerService institution and first-Admin onboarding', () => {
    let service: OwnerService;
    let prisma: Record<string, any>;

    beforeEach(() => {
        prisma = {
            legalEntity: {
                findMany: jest.fn(),
                findUnique: jest.fn(),
                create: jest.fn(),
            },
            institution: { create: jest.fn() },
            institutionAdminInvitation: {
                findFirst: jest.fn().mockResolvedValue(null),
                findUnique: jest.fn(),
                findMany: jest.fn(),
                create: jest.fn(),
                updateMany: jest.fn().mockResolvedValue({ count: 1 }),
            },
            institutionAdminInvitationContinuation: {
                updateMany: jest.fn().mockResolvedValue({ count: 1 }),
            },
            institutionAdminMembership: {
                findFirst: jest.fn().mockResolvedValue(null),
                create: jest.fn().mockResolvedValue({}),
            },
            account: {
                findUnique: jest.fn(),
                updateMany: jest.fn().mockResolvedValue({ count: 1 }),
            },
            $queryRaw: jest.fn().mockResolvedValue([{ id: institutionId }]),
            $transaction: jest.fn((callback: (transaction: typeof prisma) => unknown) =>
                callback(prisma),
            ),
        };
        service = new OwnerService(prisma as unknown as PrismaService);
    });

    it('returns nullable legacy codes and derives each Institution full code', async () => {
        prisma.legalEntity.findMany.mockResolvedValue([
            {
                id: legalEntityId,
                name: 'Group',
                code: 'SPEG',
                institutions: [
                    { id: institutionId, name: 'School', code_suffix: 'MAIN' },
                    { id: 'legacy-id', name: 'Legacy School', code_suffix: null },
                ],
            },
            {
                id: 'legacy-entity-id',
                name: 'Legacy Group',
                code: null,
                institutions: [
                    { id: 'legacy-institution-id', name: 'Old School', code_suffix: null },
                ],
            },
        ]);

        await expect(service.listLegalEntities()).resolves.toEqual({
            legal_entities: [
                {
                    id: legalEntityId,
                    name: 'Group',
                    code: 'SPEG',
                    institutions: [
                        { id: institutionId, name: 'School', code: 'SPEG-MAIN' },
                        { id: 'legacy-id', name: 'Legacy School', code: null },
                    ],
                },
                {
                    id: 'legacy-entity-id',
                    name: 'Legacy Group',
                    code: null,
                    institutions: [{ id: 'legacy-institution-id', name: 'Old School', code: null }],
                },
            ],
        });
    });

    it('creates a coded LegalEntity with the Owner-only create contract', async () => {
        prisma.legalEntity.create.mockResolvedValue({
            id: legalEntityId,
            name: 'Group',
            code: 'SPEG',
        });

        await expect(service.createLegalEntity({ name: 'Group', code: 'SPEG' })).resolves.toEqual({
            legal_entity: { id: legalEntityId, name: 'Group', code: 'SPEG' },
        });
        expect(prisma.legalEntity.create).toHaveBeenCalledWith({
            data: { name: 'Group', code: 'SPEG' },
            select: { id: true, name: true, code: true },
        });
    });

    it('atomically creates a coded Institution and recipient-bound invitation', async () => {
        prisma.legalEntity.findUnique.mockResolvedValue({ id: legalEntityId, code: 'SPEG' });
        prisma.institution.create.mockResolvedValue({
            id: institutionId,
            legal_entity_id: legalEntityId,
            name: 'Main School',
            code_suffix: 'MAIN',
        });
        prisma.institutionAdminInvitation.create.mockImplementation(({ data }) =>
            Promise.resolve({
                id: invitationId,
                status: 'PENDING',
                created_at: now,
                expires_at: data.expires_at,
            }),
        );

        const result = await service.createInstitutionAndIssueInvitation(
            legalEntityId,
            {
                name: 'Main School',
                code_suffix: 'MAIN',
                invited_email: '  Admin@Example.Test ',
                contact_name: 'Contact',
                contact_phone: '+1-555-0100',
            },
            'http://localhost:5173',
        );

        const data = prisma.institutionAdminInvitation.create.mock.calls[0][0].data;
        const bearer = new URL(result.invitation.one_time_invitation_url).hash.slice(1);
        expect(prisma.$transaction).toHaveBeenCalledTimes(1);
        expect(prisma.institution.create).toHaveBeenCalledWith({
            data: { legal_entity_id: legalEntityId, name: 'Main School', code_suffix: 'MAIN' },
            select: {
                id: true,
                legal_entity_id: true,
                name: true,
                code_suffix: true,
            },
        });
        expect(data).toEqual(
            expect.objectContaining({
                institution_id: institutionId,
                token_hash: createHash('sha256').update(bearer).digest('hex'),
                invited_email: 'admin@example.test',
                owner_contact_name: 'Contact',
                owner_contact_phone: '+1-555-0100',
            }),
        );
        expect(result).toEqual({
            institution: {
                id: institutionId,
                legal_entity_id: legalEntityId,
                name: 'Main School',
                code: 'SPEG-MAIN',
            },
            invitation: {
                id: invitationId,
                status: 'PENDING',
                created_at: now.toISOString(),
                expires_at: data.expires_at.toISOString(),
                invited_email: 'admin@example.test',
                one_time_invitation_url: expect.stringContaining('#'),
            },
        });
    });

    it('does not create an Institution without a LegalEntity code', async () => {
        prisma.legalEntity.findUnique.mockResolvedValue({ id: legalEntityId, code: null });
        await expect(
            service.createInstitutionAndIssueInvitation(
                legalEntityId,
                {
                    name: 'Main School',
                    code_suffix: 'MAIN',
                    invited_email: 'admin@example.test',
                },
                'http://localhost:5173',
            ),
        ).rejects.toThrow(ConflictException);
        expect(prisma.institution.create).not.toHaveBeenCalled();
        expect(prisma.institutionAdminInvitation.create).not.toHaveBeenCalled();
    });

    it('shows nullable recipient/contact details in Owner claim review', async () => {
        prisma.institutionAdminInvitation.findMany.mockResolvedValue([
            {
                id: invitationId,
                status: 'PENDING_APPROVAL',
                invited_email: null,
                owner_contact_name: null,
                owner_contact_phone: null,
                claimed_by_account_id: claimantId,
                claimed_by_account: { email: 'legacy-claimant@example.test' },
                claimant_name: 'Unverified Name',
                claimed_at: now,
                review_expires_at: reviewDeadline,
            },
        ]);

        await expect(service.listPendingFirstAdminClaims(institutionId)).resolves.toEqual({
            claims: [
                {
                    id: invitationId,
                    status: 'PENDING_APPROVAL',
                    invited_email: null,
                    owner_contact_name: null,
                    owner_contact_phone: null,
                    claimant_account_id: claimantId,
                    claimant_login_identifier: 'legacy-claimant@example.test',
                    claimant_provided_name: 'Unverified Name',
                    claimed_at: now.toISOString(),
                    review_expires_at: reviewDeadline.toISOString(),
                },
            ],
        });
    });

    it('cannot approve a legacy unbound claim or a claimant with a different normalized email', async () => {
        prisma.institutionAdminInvitation.findUnique.mockResolvedValue(makePendingClaim(null));
        prisma.account.findUnique.mockResolvedValue(makeClaimant('admin@example.test'));

        await expect(
            service.decideFirstAdminInvitation(institutionId, invitationId, ownerId, 'APPROVE'),
        ).rejects.toThrow('does not match the addressed invitation');
        expect(prisma.institutionAdminMembership.create).not.toHaveBeenCalled();
        expect(prisma.account.updateMany).not.toHaveBeenCalled();

        prisma.institutionAdminInvitation.findUnique.mockResolvedValue(
            makePendingClaim('different@example.test'),
        );
        await expect(
            service.decideFirstAdminInvitation(institutionId, invitationId, ownerId, 'APPROVE'),
        ).rejects.toThrow('does not match the addressed invitation');
        expect(prisma.institutionAdminMembership.create).not.toHaveBeenCalled();
    });

    it('atomically approves only an eligible claimant whose normalized email matches', async () => {
        prisma.institutionAdminInvitation.findUnique.mockResolvedValue(
            makePendingClaim('admin@example.test'),
        );
        prisma.account.findUnique.mockResolvedValue(makeClaimant(' ADMIN@example.test '));

        const result = await service.decideFirstAdminInvitation(
            institutionId,
            invitationId,
            ownerId,
            'APPROVE',
        );

        expect(prisma.account.updateMany).toHaveBeenCalledWith({
            where: { id: claimantId, identity_kind: 'UNASSIGNED' },
            data: { identity_kind: 'INSTITUTION_ADMIN' },
        });
        expect(prisma.institutionAdminMembership.create).toHaveBeenCalledWith({
            data: { account_id: claimantId, institution_id: institutionId },
        });
        expect(result).toEqual(
            expect.objectContaining({
                status: 'APPROVED',
                decided_by_account_id: ownerId,
                decided_at: expect.any(String),
            }),
        );
        expect(result).not.toHaveProperty('session');
    });

    it('closes a legacy unbound pending claim and atomically issues a bound replacement', async () => {
        let priorApprovalCheckFinished = false;
        prisma.institutionAdminInvitation.findFirst.mockImplementation(async () => {
            await Promise.resolve();
            priorApprovalCheckFinished = true;
            return null;
        });
        prisma.institutionAdminMembership.findFirst.mockImplementation(async () => {
            expect(priorApprovalCheckFinished).toBe(true);
            return null;
        });
        prisma.institutionAdminInvitation.findUnique
            .mockResolvedValueOnce({
                id: invitationId,
                institution_id: institutionId,
                status: 'PENDING_APPROVAL',
                expires_at: new Date(now.getTime() + 60_000),
                invited_email: null,
            })
            .mockResolvedValueOnce(null);
        prisma.institutionAdminInvitation.create.mockImplementation(({ data }) =>
            Promise.resolve({
                id: 'replacement-id',
                status: 'PENDING',
                created_at: now,
                expires_at: data.expires_at,
            }),
        );

        const result = await service.replaceFirstAdminInvitation(
            institutionId,
            invitationId,
            {
                invited_email: 'new-admin@example.test',
                contact_name: 'Owner contact',
            },
            'http://localhost:5173',
            ownerId,
        );

        expect(prisma.institutionAdminInvitation.updateMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    id: invitationId,
                    status: 'PENDING_APPROVAL',
                }),
                data: expect.objectContaining({
                    status: 'REVOKED',
                    revoked_at: expect.any(Date),
                    decided_by_account_id: ownerId,
                    decided_at: expect.any(Date),
                }),
            }),
        );
        expect(prisma.institutionAdminInvitationContinuation.updateMany).toHaveBeenCalledWith({
            where: {
                invitation_id: invitationId,
                revoked_at: null,
                consumed_at: null,
            },
            data: { revoked_at: expect.any(Date) },
        });
        expect(prisma.account.updateMany).not.toHaveBeenCalled();
        expect(prisma.institutionAdminInvitation.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    institution_id: institutionId,
                    invited_email: 'new-admin@example.test',
                    owner_contact_name: 'Owner contact',
                    owner_contact_phone: null,
                }),
            }),
        );
        expect(result).toEqual(
            expect.objectContaining({
                id: 'replacement-id',
                invited_email: 'new-admin@example.test',
                one_time_invitation_url: expect.stringContaining('#'),
            }),
        );
    });

    it('does not reissue a bound claim until the Owner decides it', async () => {
        prisma.institutionAdminInvitation.findUnique.mockResolvedValue({
            id: invitationId,
            institution_id: institutionId,
            status: 'PENDING_APPROVAL',
            expires_at: new Date(now.getTime() + 60_000),
            invited_email: 'admin@example.test',
        });

        await expect(
            service.replaceFirstAdminInvitation(
                institutionId,
                invitationId,
                { invited_email: 'new-admin@example.test' },
                'http://localhost:5173',
                ownerId,
            ),
        ).rejects.toThrow('A submitted claim must be decided before reissue');
        expect(prisma.institutionAdminInvitation.create).not.toHaveBeenCalled();
        expect(prisma.institutionAdminInvitationContinuation.updateMany).not.toHaveBeenCalled();
    });
});

function makePendingClaim(invitedEmail: string | null) {
    return {
        id: invitationId,
        institution_id: institutionId,
        status: 'PENDING_APPROVAL',
        created_at: now,
        expires_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        accepted_at: null,
        revoked_at: null,
        invited_email: invitedEmail,
        claimed_at: now,
        claimed_by_account_id: claimantId,
        claimant_name: 'Claimant Name',
        review_expires_at: reviewDeadline,
        decided_at: null,
        decided_by_account_id: null,
        claimed_by_account: {
            id: claimantId,
            email: 'admin@example.test',
            identity_kind: 'UNASSIGNED',
            owner_grant: null,
            institution_admin_membership: null,
        },
    };
}

function makeClaimant(email: string) {
    return {
        id: claimantId,
        email,
        identity_kind: 'UNASSIGNED',
        owner_grant: null,
        institution_admin_membership: null,
    };
}
