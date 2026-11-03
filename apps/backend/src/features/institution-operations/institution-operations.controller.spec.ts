import { INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { ZodSerializerInterceptor } from 'nestjs-zod';
import type { ExecutionContext } from '@nestjs/common';
import type { App } from 'supertest/types';
import request from 'supertest';
import { InstitutionStaffJwtAuthGuard } from '../../common/guards/institution-staff-jwt-auth.guard';
import type { AuthenticatedStaffRequest } from '../../common/guards/institution-staff-jwt-auth.guard';
import { InstitutionOperationsService } from './institution-operations.service';
import { InstitutionStaffOperationsController } from './institution-operations.controller';

const institutionId = '00000000-0000-4000-8000-000000000001';
const requestInstitutionId = '00000000-0000-4000-8000-000000000002';

describe('InstitutionStaffOperationsController context endpoint', () => {
    let app: INestApplication<App>;
    const operationsService = {
        getStaffContext: jest.fn().mockResolvedValue({
            institution_name: 'Current Institution',
            timezone: null,
        }),
    };
    const staffGuard = {
        canActivate: jest.fn((context: ExecutionContext) => {
            const request = context.switchToHttp().getRequest<AuthenticatedStaffRequest>();
            request.user = {
                id: 'staff-account-id',
                email: 'staff@example.test',
                identity_kind: 'INSTITUTION_STAFF',
                institution_id: institutionId,
                group_ids: [],
            };
            return true;
        }),
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        const moduleBuilder = Test.createTestingModule({
            controllers: [InstitutionStaffOperationsController],
            providers: [{ provide: InstitutionOperationsService, useValue: operationsService }],
        });
        moduleBuilder.overrideGuard(InstitutionStaffJwtAuthGuard).useValue(staffGuard);
        const moduleFixture: TestingModule = await moduleBuilder.compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalInterceptors(new ZodSerializerInterceptor(app.get(Reflector)));
        await app.init();
    });

    afterEach(async () => {
        if (app) {
            await app.close();
        }
    });

    it('uses only the Institution scope attached by the Staff guard', async () => {
        const response = await request(app.getHttpServer())
            .get(`/institution/staff/context?institution_id=${requestInstitutionId}`)
            .expect(200);

        expect(response.body).toEqual({
            institution_name: 'Current Institution',
            timezone: null,
        });
        expect(staffGuard.canActivate).toHaveBeenCalled();
        expect(operationsService.getStaffContext).toHaveBeenCalledWith(institutionId);
        expect(operationsService.getStaffContext).not.toHaveBeenCalledWith(requestInstitutionId);
    });
});
