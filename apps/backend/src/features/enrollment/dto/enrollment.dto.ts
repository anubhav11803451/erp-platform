import { createZodDto } from 'nestjs-zod/dto';
import { enrollStudentSchema, removeEnrollmentSchema } from '@erp/shared';

export class CreateEnrollmentDto extends createZodDto(enrollStudentSchema) {}

export class RemoveEnrollmentDto extends createZodDto(removeEnrollmentSchema) {}
