import { batchCreateSchema } from '@erp/shared';
import { createZodDto } from 'nestjs-zod/dto';

export class CreateBatchDto extends createZodDto(batchCreateSchema) {}
