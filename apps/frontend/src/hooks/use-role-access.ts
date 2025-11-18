import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth/auth-slice';
import { UserRole } from '@erp/shared';

export function useRoleAccess() {
    const user = useAppSelector(selectCurrentUser);
    const role = user?.role ?? UserRole.STAFF;

    const hasRole = (allowed: UserRole[]) => allowed.includes(role);

    const isStaff = user?.role === UserRole.STAFF;
    const isAdmin = user?.role === UserRole.ADMIN;

    return {
        user,
        role,
        isStaff,
        isAdmin,
        hasRole,
    };
}
