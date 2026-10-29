import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import type { App } from 'supertest/types';
import request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController login throttling', () => {
    let app: INestApplication<App>;
    const authService = {
        signIn: jest.fn().mockResolvedValue({
            access_token: 'access-token',
            csrf_token: 'csrf-token',
            account: {
                id: 'owner-id',
                email: 'owner@example.test',
                password_hash: 'must-not-be-serialized',
            },
        }),
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [ThrottlerModule.forRoot([{ limit: 5, ttl: 60_000 }])],
            controllers: [AuthController],
            providers: [
                { provide: AuthService, useValue: authService },
                { provide: ConfigService, useValue: { get: jest.fn() } },
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

    it('rejects the sixth login request in one minute before calling authentication', async () => {
        for (let attempt = 0; attempt < 5; attempt += 1) {
            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: 'owner@example.test', password: 'valid-password' })
                .expect(200);
            expect(response.body.account).toEqual({
                id: 'owner-id',
                email: 'owner@example.test',
            });
        }

        await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'owner@example.test', password: 'valid-password' })
            .expect(429);

        expect(authService.signIn).toHaveBeenCalledTimes(5);
    });
});
