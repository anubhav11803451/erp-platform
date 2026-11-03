import {
    authSessionResponseSchema,
    authenticatedAccountIdentityResponseSchema,
    platformOwnerLogoutResponseSchema,
    signInRequestSchema,
} from '@erp/shared';
import { createZodDto } from 'nestjs-zod/dto';

export class SignInDto extends createZodDto(signInRequestSchema) {}
export const AuthSessionResponseDto = createZodDto(authSessionResponseSchema);
Object.defineProperty(AuthSessionResponseDto, 'name', { value: 'AuthSessionResponseDto' });

export const AuthenticatedAccountIdentityResponseDto = createZodDto(
    authenticatedAccountIdentityResponseSchema,
);
Object.defineProperty(AuthenticatedAccountIdentityResponseDto, 'name', {
    value: 'AuthenticatedAccountIdentityResponseDto',
});

export class PlatformOwnerLogoutResponseDto extends createZodDto(
    platformOwnerLogoutResponseSchema,
) {}
