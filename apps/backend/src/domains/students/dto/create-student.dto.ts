import { createZodDto } from 'nestjs-zod/dto';
import { studentCreateSchema } from '@erp/shared';

export class CreateStudentDto extends createZodDto(studentCreateSchema) {}
