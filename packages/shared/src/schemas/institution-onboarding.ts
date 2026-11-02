import { z } from 'zod/v4';
import {
    institutionCodeSuffixSchema,
    institutionFullCodeSchema,
    legalEntityCodeSchema,
    normalizedEmailSchema,
} from './primitives';

export {
    institutionCodeSuffixSchema,
    institutionFullCodeSchema,
    legalEntityCodeSchema,
    normalizedEmailResponseSchema,
    normalizedEmailSchema,
} from './primitives';

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

const contactNameSchema = z.string().trim().min(1).max(160);
const contactPhoneSchema = z.string().trim().min(1).max(64);

export const institutionAdminInvitationRecipientSchema = z
    .object({
        invited_email: normalizedEmailSchema,
        contact_name: contactNameSchema.optional(),
        contact_phone: contactPhoneSchema.optional(),
    })
    .strict();

export const legalEntityCreateRequestSchema = z
    .object({
        name: nameSchema,
        code: legalEntityCodeSchema,
    })
    .strict();

export const institutionAdminInvitationCreateRequestSchema = z
    .object({
        name: nameSchema,
        code_suffix: institutionCodeSuffixSchema,
    })
    .extend(institutionAdminInvitationRecipientSchema.shape)
    .strict();

export const legalEntityRecordSchema = z
    .object({
        id: uuidSchema,
        name: nameSchema,
        code: legalEntityCodeSchema.nullable(),
    })
    .strict();

export const institutionRecordSchema = z
    .object({
        id: uuidSchema,
        legal_entity_id: uuidSchema,
        name: nameSchema,
        code: institutionFullCodeSchema.nullable(),
    })
    .strict();

export const legalEntityCreateResponseSchema = z
    .object({
        legal_entity: legalEntityRecordSchema.extend({
            code: legalEntityCodeSchema,
        }),
    })
    .strict();

export const institutionCreateResponseSchema = z
    .object({
        institution: institutionRecordSchema.extend({
            code: institutionFullCodeSchema,
        }),
    })
    .strict();

export const legalEntityDirectoryGroupSchema = legalEntityRecordSchema.extend({
    institutions: z.array(institutionRecordSchema.omit({ legal_entity_id: true })),
});

export const legalEntityDirectoryResponseSchema = z
    .object({
        legal_entities: z.array(legalEntityDirectoryGroupSchema),
    })
    .strict();

export type LegalEntityDirectoryGroup = z.infer<typeof legalEntityDirectoryGroupSchema>;
export type LegalEntityCreateRequest = z.infer<typeof legalEntityCreateRequestSchema>;
export type InstitutionAdminInvitationCreateRequest = z.infer<
    typeof institutionAdminInvitationCreateRequestSchema
>;
export type LegalEntityRecord = z.infer<typeof legalEntityRecordSchema>;
export type InstitutionRecord = z.infer<typeof institutionRecordSchema>;
export type LegalEntityCreateResponse = z.infer<typeof legalEntityCreateResponseSchema>;
export type InstitutionCreateResponse = z.infer<typeof institutionCreateResponseSchema>;
export type LegalEntityDirectoryResponse = z.infer<typeof legalEntityDirectoryResponseSchema>;
