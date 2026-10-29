import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import type { App } from 'supertest/types';
import request from 'supertest';
import { PlatformOwnerJwtAuthGuard } from '../common/guards/platform-owner-jwt-auth.guard';
import { OwnerController } from './owner.controller';
import { OwnerService } from './owner.service';

describe('OwnerController', () => {
    let app: INestApplication<App>;
    let isAuthorized: boolean;
    let ownerService: {
        listLegalEntities: jest.Mock;
        createInitialPair: jest.Mock;
    };
    let authGuard: { canActivate: jest.Mock };

    beforeEach(async () => {
        isAuthorized = false;
        ownerService = {
            listLegalEntities: jest.fn(),
            createInitialPair: jest.fn(),
        };
        authGuard = {
            canActivate: jest.fn(() => {
                if (!isAuthorized) {
                    throw new UnauthorizedException();
                }
                return true;
            }),
        };

        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [OwnerController],
            providers: [{ provide: OwnerService, useValue: ownerService }],
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

    it('requires Platform Owner authorization for both routes', async () => {
        await request(app.getHttpServer()).get('/owner/legal-entities').expect(401);
        await request(app.getHttpServer())
            .post('/owner/legal-entities')
            .send({ legal_entity_name: 'Group', institution_name: 'School' })
            .expect(401);

        expect(ownerService.listLegalEntities).not.toHaveBeenCalled();
        expect(ownerService.createInitialPair).not.toHaveBeenCalled();
    });

    it('serializes the grouped LegalEntity response through the shared schema', async () => {
        isAuthorized = true;
        ownerService.listLegalEntities.mockResolvedValue({
            legal_entities: [
                {
                    id: '00000000-0000-4000-8000-000000000001',
                    name: 'Group',
                    internal_note: 'not part of the response contract',
                    institutions: [
                        {
                            id: '00000000-0000-4000-8000-000000000002',
                            name: 'School',
                            internal_note: 'not part of the response contract',
                        },
                    ],
                },
            ],
        });

        await request(app.getHttpServer())
            .get('/owner/legal-entities')
            .expect(200, {
                legal_entities: [
                    {
                        id: '00000000-0000-4000-8000-000000000001',
                        name: 'Group',
                        institutions: [
                            {
                                id: '00000000-0000-4000-8000-000000000002',
                                name: 'School',
                            },
                        ],
                    },
                ],
            });
    });

    it('validates and trims the names-only create contract', async () => {
        isAuthorized = true;
        ownerService.createInitialPair.mockResolvedValue({
            legal_entity: {
                id: '00000000-0000-4000-8000-000000000001',
                name: 'Group',
            },
            institution: {
                id: '00000000-0000-4000-8000-000000000002',
                legal_entity_id: '00000000-0000-4000-8000-000000000001',
                name: 'School',
            },
        });

        await request(app.getHttpServer())
            .post('/owner/legal-entities')
            .send({
                legal_entity_name: '  Group  ',
                institution_name: '  School  ',
            })
            .expect(201, {
                legal_entity: {
                    id: '00000000-0000-4000-8000-000000000001',
                    name: 'Group',
                },
                institution: {
                    id: '00000000-0000-4000-8000-000000000002',
                    legal_entity_id: '00000000-0000-4000-8000-000000000001',
                    name: 'School',
                },
            });

        expect(ownerService.createInitialPair).toHaveBeenCalledWith({
            legal_entity_name: 'Group',
            institution_name: 'School',
        });
    });

    it('rejects invalid names and fields outside the shared create contract', async () => {
        isAuthorized = true;

        await request(app.getHttpServer())
            .post('/owner/legal-entities')
            .send({ legal_entity_name: ' ', institution_name: 'School' })
            .expect(400);
        await request(app.getHttpServer())
            .post('/owner/legal-entities')
            .send({
                legal_entity_name: 'Group',
                institution_name: 'School',
                institution_id: 'client-controlled-id',
            })
            .expect(400);

        expect(ownerService.createInitialPair).not.toHaveBeenCalled();
    });
});
