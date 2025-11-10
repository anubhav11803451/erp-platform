import { userCreateSchema } from '@erp/shared';
import { createZodDto } from 'nestjs-zod/dto';

export class CreateUserDto extends createZodDto(userCreateSchema) {}
