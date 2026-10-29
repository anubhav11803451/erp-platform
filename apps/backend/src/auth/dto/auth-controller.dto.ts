import {
    platformOwnerAccountResponseSchema,
    platformOwnerLogoutResponseSchema,
    platformOwnerSignInResponseSchema,
    platformOwnerSignInSchema,
} from '@erp/shared';
import { createZodDto } from 'nestjs-zod/dto';

export class PlatformOwnerSignInDto extends createZodDto(platformOwnerSignInSchema) {}
export class PlatformOwnerSignInResponseDto extends createZodDto(
    platformOwnerSignInResponseSchema,
) {}
export class PlatformOwnerLogoutResponseDto extends createZodDto(
    platformOwnerLogoutResponseSchema,
) {}
export class PlatformOwnerAccountResponseDto extends createZodDto(
    platformOwnerAccountResponseSchema,
) {}
