import { z } from 'zod/v4';

const nameSchema = z.string().trim().min(1).max(160);
const uuidSchema = z.uuid();

export const legalEntitySchema = z.object({
    id: uuidSchema,
    name: nameSchema,
});

export const institutionSchema = z.object({
    id: uuidSchema,
    legal_entity_id: uuidSchema,
    name: nameSchema,
});

const legalEntityCreateSchema = legalEntitySchema.omit({ id: true });
const institutionCreateSchema = institutionSchema.omit({ id: true, legal_entity_id: true });

export const institutionPairCreateSchema = z
    .object({
        legal_entity_name: legalEntityCreateSchema.shape.name,
        institution_name: institutionCreateSchema.shape.name,
    })
    .strict();

export const legalEntityInstitutionGroupSchema = legalEntitySchema.extend({
    institutions: z.array(institutionSchema.omit({ legal_entity_id: true })),
});

export const legalEntityListResponseSchema = z.object({
    legal_entities: z.array(legalEntityInstitutionGroupSchema),
});

export const institutionPairCreateResponseSchema = z.object({
    legal_entity: legalEntitySchema,
    institution: institutionSchema,
});

export type InstitutionPairCreatePayload = z.infer<typeof institutionPairCreateSchema>;
export type LegalEntityInstitutionGroup = z.infer<typeof legalEntityInstitutionGroupSchema>;
export type LegalEntityListResponse = z.infer<typeof legalEntityListResponseSchema>;
export type InstitutionPairCreateResponse = z.infer<typeof institutionPairCreateResponseSchema>;
