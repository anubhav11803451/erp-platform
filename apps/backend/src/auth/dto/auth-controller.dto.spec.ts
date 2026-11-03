import {
    AuthSessionResponseDto,
    AuthenticatedAccountIdentityResponseDto,
} from './auth-controller.dto';

describe('Auth response DTO OpenAPI names', () => {
    it('gives each Zod output DTO a unique class name', () => {
        const outputNames = [
            Object.getOwnPropertyDescriptor(AuthSessionResponseDto.Output, 'name')?.value,
            Object.getOwnPropertyDescriptor(AuthenticatedAccountIdentityResponseDto.Output, 'name')
                ?.value,
        ];

        expect(outputNames).toEqual([
            'AuthSessionResponseDto_Output',
            'AuthenticatedAccountIdentityResponseDto_Output',
        ]);
        expect(new Set(outputNames).size).toBe(outputNames.length);
    });
});
