import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import type { App } from 'supertest/types';
import request from 'supertest';
import { InstitutionStaffInvitationController } from './institution-staff-invitation.controller';
import { InstitutionStaffInvitationService } from './institution-staff-invitation.service';

describe('InstitutionStaffInvitationController pre-auth endpoints', () => {
    let app: INestApplication<App>;
    const staffService = {
        getInvitationContext: jest.fn().mockResolvedValue({
            institution_id: '00000000-0000-4000-8000-000000000001',
            institution_name: 'School',
            invited_email: 'staff@example.test',
            expires_at: '2026-11-09T00:00:00.000Z',
            groups: [],
        }),
        acceptInvitation: jest.fn().mockResolvedValue({ accepted: true }),
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [ThrottlerModule.forRoot([{ limit: 5, ttl: 60_000 }])],
            controllers: [InstitutionStaffInvitationController],
            providers: [
                { provide: InstitutionStaffInvitationService, useValue: staffService },
                {
                    provide: ConfigService,
                    useValue: { getOrThrow: jest.fn().mockReturnValue('https://erp.example.test') },
                },
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ZodValidationPipe());
        app.useGlobalInterceptors(new ZodSerializerInterceptor(app.get(Reflector)));
        await app.init();
    });

    afterEach(async () => {
        await app.close();
    });

    it('requires exact Origin and returns a no-store context without bearer data', async () => {
        await request(app.getHttpServer())
            .post('/auth/staff-invitations/context')
            .send({ token: 'bearer-token' })
            .expect(403);
        expect(staffService.getInvitationContext).not.toHaveBeenCalled();

        const response = await request(app.getHttpServer())
            .post('/auth/staff-invitations/context')
            .set('Origin', 'https://erp.example.test')
            .send({ token: 'bearer-token' })
            .expect(200);

        expect(response.headers['cache-control']).toBe('no-store');
        expect(response.headers['referrer-policy']).toBe('no-referrer');
        expect(response.body).not.toHaveProperty('token');
        expect(response.body).not.toHaveProperty('invitation_url');
        expect(staffService.getInvitationContext).toHaveBeenCalledWith('bearer-token');
    });

    it('rejects an untrusted Origin before accepting the invitation', async () => {
        await request(app.getHttpServer())
            .post('/auth/staff-invitations/accept')
            .set('Origin', 'https://unexpected.example')
            .send({ token: 'bearer-token', password: 'valid-password' })
            .expect(403);

        expect(staffService.acceptInvitation).not.toHaveBeenCalled();
    });
});
