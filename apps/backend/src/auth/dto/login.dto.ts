import { signInSchema } from '@erp/shared';
import { createZodDto } from 'nestjs-zod';

export class UserLoginDto extends createZodDto(signInSchema) {}
