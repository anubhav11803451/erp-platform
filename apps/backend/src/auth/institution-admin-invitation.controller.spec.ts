import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import type { App } from 'supertest/types';
import request from 'supertest';
import { InvitationSecurityHeadersInterceptor } from '../common/interceptors/invitation-security-headers.interceptor';
import { InstitutionAdminInvitationController } from './institution-admin-invitation.controller';
import { InstitutionAdminInvitationService } from './institution-admin-invitation.service';

describe('InstitutionAdminInvitationController browser protections', () => {
    let app: INestApplication<App>;
    const invitationService = {
        exchange: jest.fn().mockResolvedValue({
            institution: {
                id: '00000000-0000-4000-8000-000000000001',
                name: 'School',
                code: 'SPEG-MAIN',
            },
            invited_email: 'admin@example.test',
            invitation_expires_at: '2026-11-05T00:00:00.000Z',
            csrf_token: 'continuation-csrf-token',
        }),
        resume: jest.fn(),
        claimExistingAccount: jest.fn(),
        claimNewAccount: jest.fn(),
        getClaimantStatus: jest.fn(),
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [ThrottlerModule.forRoot([{ limit: 5, ttl: 60_000 }])],
            controllers: [InstitutionAdminInvitationController],
            providers: [
                { provide: InstitutionAdminInvitationService, useValue: invitationService },
                InvitationSecurityHeadersInterceptor,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue(undefined),
                        getOrThrow: jest.fn().mockReturnValue('http://localhost:5173'),
                    },
                },
            ],
        }).compile();
        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ZodValidationPipe());
        app.useGlobalInterceptors(new ZodSerializerInterceptor(app.get(Reflector)));
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        invitationService.exchange.mockResolvedValue({
            institution: {
                id: '00000000-0000-4000-8000-000000000001',
                name: 'School',
                code: 'SPEG-MAIN',
            },
            invited_email: 'admin@example.test',
            invitation_expires_at: '2026-11-05T00:00:00.000Z',
            csrf_token: 'continuation-csrf-token',
        });
    });

    it('requires an exact configured Origin before accepting the bearer exchange', async () => {
        await request(app.getHttpServer())
            .post('/auth/invitations/exchange')
            .set('Origin', 'https://unexpected.example')
            .send({ bearer_token: 'invitation-bearer' })
            .expect(403);
        expect(invitationService.exchange).not.toHaveBeenCalled();
    });

    it('sets no-store and no-referrer headers on the bearer exchange response', async () => {
        const result = await request(app.getHttpServer())
            .post('/auth/invitations/exchange')
            .set('Origin', 'http://localhost:5173')
            .send({ bearer_token: 'invitation-bearer' })
            .expect(200);
        expect(result.headers['cache-control']).toBe('no-store');
        expect(result.headers['referrer-policy']).toBe('no-referrer');
        expect(result.body.csrf_token).toEqual(expect.any(String));
        expect(invitationService.exchange).toHaveBeenCalledWith(
            'invitation-bearer',
            expect.any(Object),
        );
    });

    it('requires synchronizer CSRF on claim mutations and exact Origin on status reads', async () => {
        await request(app.getHttpServer())
            .post('/auth/invitations/claim')
            .set('Origin', 'http://localhost:5173')
            .send({ claimant_provided_name: 'Claimant Name' })
            .expect(403);
        expect(invitationService.claimExistingAccount).not.toHaveBeenCalled();

        await request(app.getHttpServer())
            .post('/auth/invitations/status')
            .set('Origin', 'https://unexpected.example')
            .send({})
            .expect(403);
        expect(invitationService.getClaimantStatus).not.toHaveBeenCalled();
    });

    it('does not expose role-specific sign-in or invitation session refresh/logout endpoints', async () => {
        await request(app.getHttpServer())
            .post('/auth/invitations/sign-in')
            .send({ email: 'admin@example.test', password: 'valid-password' })
            .expect(404);
        await request(app.getHttpServer())
            .post('/auth/invitations/session/refresh')
            .send({})
            .expect(404);
        await request(app.getHttpServer()).post('/auth/invitations/logout').send({}).expect(404);
    });
});
