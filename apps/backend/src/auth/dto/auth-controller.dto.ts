import {
    authSessionResponseSchema,
    authenticatedAccountIdentityResponseSchema,
    platformOwnerLogoutResponseSchema,
    signInRequestSchema,
} from '@erp/shared';
import { createZodDto } from 'nestjs-zod/dto';

export class SignInDto extends createZodDto(signInRequestSchema) {}
export const AuthSessionResponseDto = createZodDto(authSessionResponseSchema);
export const AuthenticatedAccountIdentityResponseDto = createZodDto(
    authenticatedAccountIdentityResponseSchema,
);
export class PlatformOwnerLogoutResponseDto extends createZodDto(
    platformOwnerLogoutResponseSchema,
) {}
