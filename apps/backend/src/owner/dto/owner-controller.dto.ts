import {
    institutionPairCreateSchema,
    institutionPairCreateResponseSchema,
    legalEntityListResponseSchema,
} from '@erp/shared';
import { createZodDto } from 'nestjs-zod/dto';

export class CreateInitialLegalEntityDto extends createZodDto(institutionPairCreateSchema) {}
export class InstitutionPairResponseDto extends createZodDto(institutionPairCreateResponseSchema) {}
export class LegalEntityListResponseDto extends createZodDto(legalEntityListResponseSchema) {}
