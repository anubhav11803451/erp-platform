import { guardianCreateSchema } from '@erp/shared';
import { createZodDto } from 'nestjs-zod';

export class CreateGuardianDto extends createZodDto(guardianCreateSchema) {}
