import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth/auth-slice';
import type { AppRole } from '@/config/permissions';

export function useRoleAccess() {
    const user = useAppSelector(selectCurrentUser);
    const role = user?.identity_kind ?? null;

    const hasRole = (allowed: readonly AppRole[]) => role !== null && allowed.includes(role);

    return {
        user,
        role,
        isPlatformOwner: role === 'PLATFORM_OWNER',
        isInstitutionAdmin: role === 'INSTITUTION_ADMIN',
        hasRole,
    };
}
