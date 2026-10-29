import { Injectable } from '@nestjs/common';
import {
    type InstitutionPairCreatePayload,
    type InstitutionPairCreateResponse,
    type LegalEntityListResponse,
} from '@erp/shared';
import { PrismaService } from '../core/prisma.service';

@Injectable()
export class OwnerService {
    constructor(private readonly prisma: PrismaService) {}

    async listLegalEntities(): Promise<LegalEntityListResponse> {
        const legalEntities = await this.prisma.legalEntity.findMany({
            select: {
                id: true,
                name: true,
                institutions: {
                    select: { id: true, name: true },
                    orderBy: { created_at: 'asc' },
                },
            },
            orderBy: { created_at: 'asc' },
        });

        return {
            legal_entities: legalEntities.map(({ id, name, institutions }) => ({
                id,
                name,
                institutions: institutions.map(({ id: institutionId, name: institutionName }) => ({
                    id: institutionId,
                    name: institutionName,
                })),
            })),
        };
    }

    createInitialPair(
        payload: InstitutionPairCreatePayload,
    ): Promise<InstitutionPairCreateResponse> {
        return this.prisma.$transaction(async (transaction) => {
            const legalEntity = await transaction.legalEntity.create({
                data: { name: payload.legal_entity_name },
                select: { id: true, name: true },
            });
            const institution = await transaction.institution.create({
                data: {
                    name: payload.institution_name,
                    legal_entity_id: legalEntity.id,
                },
                select: { id: true, legal_entity_id: true, name: true },
            });

            return {
                legal_entity: legalEntity,
                institution,
            };
        });
    }
}
