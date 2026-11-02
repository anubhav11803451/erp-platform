import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import cookieParser from 'cookie-parser';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import type { App } from 'supertest/types';
import request from 'supertest';
import { AccountSessionJwtAuthGuard } from '../common/guards/account-session-jwt-auth.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { InstitutionAdminInvitationService } from './institution-admin-invitation.service';

describe('AuthController shared sign-in and session endpoints', () => {
    let app: INestApplication<App>;
    const authService = {
        signInWorkspace: jest.fn().mockResolvedValue({
            kind: 'SESSION',
            access_token: 'access-token',
            csrf_token: 'session-csrf-token',
            identity: {
                identity_kind: 'PLATFORM_OWNER',
                account: { id: 'owner-id', email: 'owner@example.test' },
            },
        }),
        refresh: jest.fn(),
        logout: jest.fn().mockResolvedValue({ message: 'Logged out successfully' }),
        getAuthenticatedIdentity: jest.fn(),
    };
    const invitationService = {
        signInExistingAccount: jest.fn().mockResolvedValue({
            institution: {
                id: '00000000-0000-4000-8000-000000000001',
                name: 'School',
                code: 'SPEG-MAIN',
            },
            invited_email: 'admin@example.test',
            invitation_expires_at: '2026-11-05T00:00:00.000Z',
        }),
        logoutContinuation: jest.fn().mockResolvedValue(undefined),
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        authService.signInWorkspace.mockResolvedValue({
            kind: 'SESSION',
            access_token: 'access-token',
            csrf_token: 'session-csrf-token',
            identity: {
                identity_kind: 'PLATFORM_OWNER',
                account: { id: 'owner-id', email: 'owner@example.test' },
            },
        });
        invitationService.signInExistingAccount.mockResolvedValue({
            institution: {
                id: '00000000-0000-4000-8000-000000000001',
                name: 'School',
                code: 'SPEG-MAIN',
            },
            invited_email: 'admin@example.test',
            invitation_expires_at: '2026-11-05T00:00:00.000Z',
        });
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [ThrottlerModule.forRoot([{ limit: 5, ttl: 60_000 }])],
            controllers: [AuthController],
            providers: [
                { provide: AuthService, useValue: authService },
                { provide: InstitutionAdminInvitationService, useValue: invitationService },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn(),
                        getOrThrow: jest.fn().mockReturnValue('http://localhost:5173'),
                    },
                },
                AccountSessionJwtAuthGuard,
            ],
        })
            .overrideGuard(AccountSessionJwtAuthGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .compile();

        app = moduleFixture.createNestApplication();
        app.use(cookieParser());
        app.useGlobalPipes(new ZodValidationPipe());
        app.useGlobalInterceptors(new ZodSerializerInterceptor(app.get(Reflector)));
        await app.init();
    });

    afterEach(async () => {
        await app.close();
    });

    it('throttles repeated workspace login attempts and serializes only the shared session contract', async () => {
        for (let attempt = 0; attempt < 5; attempt += 1) {
            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .set('Origin', 'http://localhost:5173')
                .send({
                    intent: 'WORKSPACE',
                    email: 'owner@example.test',
                    password: 'valid-password',
                })
                .expect(200);
            expect(response.body).toEqual({
                kind: 'SESSION',
                access_token: 'access-token',
                csrf_token: 'session-csrf-token',
                identity: {
                    identity_kind: 'PLATFORM_OWNER',
                    account: { id: 'owner-id', email: 'owner@example.test' },
                },
            });
        }

        await request(app.getHttpServer())
            .post('/auth/login')
            .set('Origin', 'http://localhost:5173')
            .send({
                intent: 'WORKSPACE',
                email: 'owner@example.test',
                password: 'valid-password',
            })
            .expect(429);
        expect(authService.signInWorkspace).toHaveBeenCalledTimes(5);
    });

    it('requires the continuation cookie, synchronizer CSRF, and exact Origin for invitation intent', async () => {
        await request(app.getHttpServer())
            .post('/auth/login')
            .set('Origin', 'http://localhost:5173')
            .send({
                intent: 'INVITATION',
                email: 'admin@example.test',
                password: 'valid-password',
            })
            .expect(403);

        await request(app.getHttpServer())
            .post('/auth/login')
            .set('Origin', 'https://unexpected.example')
            .set('Cookie', 'erp360_iac=continuation; erp360_iac_ctk=csrf-token')
            .set('x-csrf-token', 'csrf-token')
            .send({
                intent: 'INVITATION',
                email: 'admin@example.test',
                password: 'valid-password',
            })
            .expect(403);
        expect(invitationService.signInExistingAccount).not.toHaveBeenCalled();
    });

    it('rejects workspace login when Origin is absent before calling the auth service', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                intent: 'WORKSPACE',
                email: 'owner@example.test',
                password: 'valid-password',
            })
            .expect(403);

        expect(response.headers['set-cookie']).toBeUndefined();
        expect(authService.signInWorkspace).not.toHaveBeenCalled();
    });

    it('rejects workspace login with an untrusted Origin before calling the auth service', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/login')
            .set('Origin', 'https://unexpected.example')
            .send({
                intent: 'WORKSPACE',
                email: 'owner@example.test',
                password: 'valid-password',
            })
            .expect(403);

        expect(response.headers['set-cookie']).toBeUndefined();
        expect(authService.signInWorkspace).not.toHaveBeenCalled();
    });

    it('returns only the safe continuation context and never falls back to workspace login', async () => {
        const result = await request(app.getHttpServer())
            .post('/auth/login')
            .set('Origin', 'http://localhost:5173')
            .set('Cookie', 'erp360_iac=continuation; erp360_iac_ctk=csrf-token')
            .set('x-csrf-token', 'csrf-token')
            .send({
                intent: 'INVITATION',
                email: 'admin@example.test',
                password: 'valid-password',
            })
            .expect(200);

        expect(result.body).toEqual({
            kind: 'INVITATION_CONTINUATION',
            institution: {
                id: '00000000-0000-4000-8000-000000000001',
                name: 'School',
                code: 'SPEG-MAIN',
            },
            invited_email: 'admin@example.test',
            invitation_expires_at: '2026-11-05T00:00:00.000Z',
        });
        expect(result.body).not.toHaveProperty('access_token');
        expect(result.body).not.toHaveProperty('continuation_token');
        expect(result.headers['cache-control']).toBe('no-store');
        expect(invitationService.signInExistingAccount).toHaveBeenCalledWith(
            'continuation',
            { email: 'admin@example.test', password: 'valid-password' },
            'csrf-token',
            expect.any(Object),
        );
        expect(authService.signInWorkspace).not.toHaveBeenCalled();
    });

    it('accepts exact-Origin workspace login independently from invitation cookies', async () => {
        await request(app.getHttpServer())
            .post('/auth/login')
            .set('Origin', 'http://localhost:5173')
            .set('Cookie', 'erp360_iac=stale-continuation; erp360_iac_ctk=stale-csrf')
            .send({
                intent: 'WORKSPACE',
                email: 'owner@example.test',
                password: 'valid-password',
            })
            .expect(200);

        expect(authService.signInWorkspace).toHaveBeenCalledTimes(1);
        expect(invitationService.signInExistingAccount).not.toHaveBeenCalled();
    });

    it('does not expose the retired role-specific sign-in route', async () => {
        await request(app.getHttpServer())
            .post('/auth/institution-admin/sign-in')
            .send({ email: 'admin@example.test', password: 'valid-password' })
            .expect(404);
    });
});
