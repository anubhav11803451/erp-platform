import { platformOwnerSignInSchema } from '@erp/shared';
import { createZodDto } from 'nestjs-zod';

export class PlatformOwnerSignInDto extends createZodDto(platformOwnerSignInSchema) {}
