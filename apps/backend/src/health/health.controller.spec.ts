import { INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { ZodSerializerInterceptor } from 'nestjs-zod';
import type { App } from 'supertest/types';
import request from 'supertest';
import { HealthController } from './health.controller';

describe('HealthController', () => {
    let app: INestApplication<App>;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [HealthController],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalInterceptors(new ZodSerializerInterceptor(app.get(Reflector)));
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('returns the shared health response contract', async () => {
        const response = await request(app.getHttpServer()).get('/health').expect(200);

        expect(response.body).toEqual({
            status: 'ok',
            timestamp: expect.any(String),
            uptimeSeconds: expect.any(Number),
        });
        expect(Number.isInteger(response.body.uptimeSeconds)).toBe(true);
    });
});
