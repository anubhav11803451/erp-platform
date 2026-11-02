import { ExecutionContext, INestApplication, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import type { App } from 'supertest/types';
import request from 'supertest';
import { PlatformOwnerJwtAuthGuard } from '../common/guards/platform-owner-jwt-auth.guard';
import { InvitationSecurityHeadersInterceptor } from '../common/interceptors/invitation-security-headers.interceptor';
import { OwnerController } from './owner.controller';
import { OwnerService } from './owner.service';

const legalEntityId = '00000000-0000-4000-8000-000000000001';
const institutionId = '00000000-0000-4000-8000-000000000002';
const invitationId = '00000000-0000-4000-8000-000000000003';
const ownerId = '00000000-0000-4000-8000-000000000004';
const claimantId = '00000000-0000-4000-8000-000000000005';

describe('OwnerController authorization and institution onboarding', () => {
    let app: INestApplication<App>;
    let isAuthorized: boolean;
    const ownerService = {
        listLegalEntities: jest.fn(),
        createLegalEntity: jest.fn(),
        createInstitutionAndIssueInvitation: jest.fn(),
        getFirstAdminInvitationStatus: jest.fn(),
        listPendingFirstAdminClaims: jest.fn(),
        decideFirstAdminInvitation: jest.fn(),
        revokeFirstAdminInvitation: jest.fn(),
        replaceFirstAdminInvitation: jest.fn(),
    };

    beforeEach(async () => {
        isAuthorized = false;
        jest.clearAllMocks();
        const authGuard = {
            canActivate: jest.fn((context: ExecutionContext) => {
                if (!isAuthorized) {
                    throw new UnauthorizedException();
                }
                context.switchToHttp().getRequest().user = { id: ownerId };
                return true;
            }),
        };
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [ThrottlerModule.forRoot([{ limit: 5, ttl: 60_000 }])],
            controllers: [OwnerController],
            providers: [
                { provide: OwnerService, useValue: ownerService },
                InvitationSecurityHeadersInterceptor,
                {
                    provide: ConfigService,
                    useValue: {
                        getOrThrow: jest.fn().mockReturnValue('http://localhost:5173'),
                    },
                },
            ],
        })
            .overrideGuard(PlatformOwnerJwtAuthGuard)
            .useValue(authGuard)
            .compile();
        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ZodValidationPipe());
        app.useGlobalInterceptors(new ZodSerializerInterceptor(app.get(Reflector)));
        await app.init();
    });

    afterEach(async () => {
        await app.close();
    });

    it('requires Platform Owner authorization for create, directory, status, review, and decision APIs', async () => {
        await request(app.getHttpServer())
            .post('/owner/legal-entities')
            .send({ name: 'Group', code: 'SPEG' })
            .expect(401);
        await request(app.getHttpServer()).get('/owner/legal-entities').expect(401);
        await request(app.getHttpServer())
            .post(`/owner/legal-entities/${legalEntityId}/institutions`)
            .send({
                name: 'School',
                code_suffix: 'MAIN',
                invited_email: 'admin@example.test',
            })
            .expect(401);
        await request(app.getHttpServer())
            .get(`/owner/legal-entities/institutions/${institutionId}/admin-invitation/claims`)
            .expect(401);
        await request(app.getHttpServer())
            .post(
                `/owner/legal-entities/institutions/${institutionId}/admin-invitations/${invitationId}/decision`,
            )
            .send({ decision: 'APPROVE' })
            .expect(401);

        expect(ownerService.createLegalEntity).not.toHaveBeenCalled();
        expect(ownerService.createInstitutionAndIssueInvitation).not.toHaveBeenCalled();
        expect(ownerService.listPendingFirstAdminClaims).not.toHaveBeenCalled();
        expect(ownerService.decideFirstAdminInvitation).not.toHaveBeenCalled();
    });

    it('creates a LegalEntity independently with the required code', async () => {
        isAuthorized = true;
        ownerService.createLegalEntity.mockResolvedValue({
            legal_entity: { id: legalEntityId, name: 'Group', code: 'SPEG' },
        });

        const response = await request(app.getHttpServer())
            .post('/owner/legal-entities')
            .send({ name: 'Group', code: 'SPEG' })
            .expect(201);

        expect(response.body.legal_entity.code).toBe('SPEG');
        expect(ownerService.createLegalEntity).toHaveBeenCalledWith({
            name: 'Group',
            code: 'SPEG',
        });
    });

    it('creates an Institution and addressed invitation through one Owner-only request', async () => {
        isAuthorized = true;
        ownerService.createInstitutionAndIssueInvitation.mockResolvedValue({
            institution: {
                id: institutionId,
                legal_entity_id: legalEntityId,
                name: 'School',
                code: 'SPEG-MAIN',
            },
            invitation: {
                id: invitationId,
                status: 'PENDING',
                created_at: '2026-10-29T00:00:00.000Z',
                expires_at: '2026-11-05T00:00:00.000Z',
                invited_email: 'admin@example.test',
                one_time_invitation_url: 'http://localhost:5173/invite/admin#one-time-secret',
            },
        });

        const result = await request(app.getHttpServer())
            .post(`/owner/legal-entities/${legalEntityId}/institutions`)
            .send({
                name: 'School',
                code_suffix: 'MAIN',
                invited_email: 'admin@example.test',
                contact_name: 'Known Contact',
            })
            .expect(201);

        expect(result.body.institution.code).toBe('SPEG-MAIN');
        expect(result.body.invitation.one_time_invitation_url).toContain('#one-time-secret');
        expect(ownerService.createInstitutionAndIssueInvitation).toHaveBeenCalledWith(
            legalEntityId,
            {
                name: 'School',
                code_suffix: 'MAIN',
                invited_email: 'admin@example.test',
                contact_name: 'Known Contact',
            },
            'http://localhost:5173',
        );
    });

    it('exposes Owner-only status including nullable legacy recipient/contact fields', async () => {
        isAuthorized = true;
        ownerService.getFirstAdminInvitationStatus.mockResolvedValue({
            id: invitationId,
            status: 'PENDING_APPROVAL',
            created_at: '2026-10-29T00:00:00.000Z',
            expires_at: '2026-11-05T00:00:00.000Z',
            invited_email: null,
            owner_contact_name: null,
            owner_contact_phone: null,
            accepted_at: null,
            revoked_at: null,
            claimed_at: '2026-10-29T01:00:00.000Z',
            claimed_by_account_id: claimantId,
            claimant_login_identifier: 'legacy@example.test',
            claimant_provided_name: 'Unverified Name',
            review_expires_at: '2026-11-05T01:00:00.000Z',
            decided_at: null,
            decided_by_account_id: null,
        });

        const result = await request(app.getHttpServer())
            .get(`/owner/legal-entities/institutions/${institutionId}/admin-invitation`)
            .expect(200);
        expect(result.body.invited_email).toBeNull();
        expect(result.body.owner_contact_name).toBeNull();
        expect(result.body).not.toHaveProperty('one_time_invitation_url');
        expect(result.body).not.toHaveProperty('status_credential_hash');
    });

    it('attributes review decisions to the authenticated Owner and rejects cross-tenant fields', async () => {
        isAuthorized = true;
        const pending = {
            id: invitationId,
            status: 'PENDING_APPROVAL',
            invited_email: 'admin@example.test',
            owner_contact_name: null,
            owner_contact_phone: null,
            claimant_account_id: claimantId,
            claimant_login_identifier: 'admin@example.test',
            claimant_provided_name: 'Unverified Name',
            claimed_at: '2026-10-29T00:00:00.000Z',
            review_expires_at: '2026-11-05T00:00:00.000Z',
        };
        ownerService.listPendingFirstAdminClaims.mockResolvedValue({ claims: [pending] });
        ownerService.decideFirstAdminInvitation.mockResolvedValue({
            id: invitationId,
            status: 'APPROVED',
            claimed_at: pending.claimed_at,
            review_expires_at: pending.review_expires_at,
            decided_at: '2026-10-29T01:00:00.000Z',
            decided_by_account_id: ownerId,
            revoked_at: null,
        });

        const claims = await request(app.getHttpServer())
            .get(`/owner/legal-entities/institutions/${institutionId}/admin-invitation/claims`)
            .expect(200);
        expect(claims.body.claims).toEqual([pending]);

        const decision = await request(app.getHttpServer())
            .post(
                `/owner/legal-entities/institutions/${institutionId}/admin-invitations/${invitationId}/decision`,
            )
            .send({ decision: 'APPROVE' })
            .expect(200);
        expect(decision.body.status).toBe('APPROVED');
        expect(ownerService.decideFirstAdminInvitation).toHaveBeenCalledWith(
            institutionId,
            invitationId,
            ownerId,
            'APPROVE',
        );

        await request(app.getHttpServer())
            .post(
                `/owner/legal-entities/institutions/${institutionId}/admin-invitations/${invitationId}/decision`,
            )
            .send({ decision: 'APPROVE', institution_id: 'client-selected' })
            .expect(400);
    });

    it('requires new recipient details for explicit invitation replacement', async () => {
        isAuthorized = true;
        ownerService.replaceFirstAdminInvitation.mockResolvedValue({
            id: '00000000-0000-4000-8000-000000000006',
            status: 'PENDING',
            created_at: '2026-10-29T00:00:00.000Z',
            expires_at: '2026-11-05T00:00:00.000Z',
            invited_email: 'new-admin@example.test',
            one_time_invitation_url: 'http://localhost:5173/invite/admin#new-secret',
        });

        const response = await request(app.getHttpServer())
            .post(
                `/owner/legal-entities/institutions/${institutionId}/admin-invitations/${invitationId}/replace`,
            )
            .send({ invited_email: 'new-admin@example.test' })
            .expect(201);

        expect(response.body.invited_email).toBe('new-admin@example.test');
        expect(ownerService.replaceFirstAdminInvitation).toHaveBeenCalledWith(
            institutionId,
            invitationId,
            { invited_email: 'new-admin@example.test' },
            'http://localhost:5173',
            ownerId,
        );
    });
});
