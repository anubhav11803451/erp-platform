import type {
    InstitutionPairCreatePayload,
    InstitutionPairCreateResponse,
    LegalEntityListResponse,
} from '@erp/shared';
import { PrismaService } from '../core/prisma.service';
import { OwnerService } from './owner.service';

describe('OwnerService', () => {
    let service: OwnerService;
    let prisma: {
        legalEntity: { findMany: jest.Mock; create: jest.Mock };
        institution: { create: jest.Mock };
        $transaction: jest.Mock;
    };

    beforeEach(() => {
        prisma = {
            legalEntity: {
                findMany: jest.fn(),
                create: jest.fn(),
            },
            institution: { create: jest.fn() },
            $transaction: jest.fn((callback: (transaction: typeof prisma) => unknown) =>
                callback(prisma),
            ),
        };
        service = new OwnerService(prisma as unknown as PrismaService);
    });

    it('maps legal entities and nested Institutions to the shared grouped response', async () => {
        prisma.legalEntity.findMany.mockResolvedValue([
            {
                id: 'group-id',
                name: 'Group',
                institutions: [
                    { id: 'institution-id', name: 'School' },
                    { id: 'second-institution-id', name: 'Second School' },
                ],
            },
        ]);

        const result: LegalEntityListResponse = await service.listLegalEntities();

        expect(result).toEqual({
            legal_entities: [
                {
                    id: 'group-id',
                    name: 'Group',
                    institutions: [
                        { id: 'institution-id', name: 'School' },
                        { id: 'second-institution-id', name: 'Second School' },
                    ],
                },
            ],
        });
        expect(prisma.legalEntity.findMany).toHaveBeenCalledWith({
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
    });

    it('creates the LegalEntity and first Institution inside one transaction', async () => {
        prisma.legalEntity.create.mockResolvedValue({ id: 'group-id', name: 'Group' });
        prisma.institution.create.mockResolvedValue({
            id: 'institution-id',
            legal_entity_id: 'group-id',
            name: 'School',
        });
        const payload: InstitutionPairCreatePayload = {
            legal_entity_name: 'Group',
            institution_name: 'School',
        };

        const result: InstitutionPairCreateResponse = await service.createInitialPair(payload);

        expect(prisma.$transaction).toHaveBeenCalledTimes(1);
        expect(prisma.legalEntity.create).toHaveBeenCalledWith({
            data: { name: 'Group' },
            select: { id: true, name: true },
        });
        expect(prisma.institution.create).toHaveBeenCalledWith({
            data: { name: 'School', legal_entity_id: 'group-id' },
            select: { id: true, legal_entity_id: true, name: true },
        });
        expect(result).toEqual({
            legal_entity: { id: 'group-id', name: 'Group' },
            institution: {
                id: 'institution-id',
                legal_entity_id: 'group-id',
                name: 'School',
            },
        });
    });

    it('propagates a failed Institution write from the paired transaction', async () => {
        const transactionError = new Error('Institution creation failed');
        prisma.legalEntity.create.mockResolvedValue({ id: 'group-id', name: 'Group' });
        prisma.institution.create.mockRejectedValue(transactionError);

        await expect(
            service.createInitialPair({
                legal_entity_name: 'Group',
                institution_name: 'School',
            }),
        ).rejects.toBe(transactionError);

        expect(prisma.$transaction).toHaveBeenCalledTimes(1);
        expect(prisma.legalEntity.create).toHaveBeenCalledTimes(1);
        expect(prisma.institution.create).toHaveBeenCalledTimes(1);
    });
});
