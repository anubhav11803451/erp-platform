import type { AppRole } from '@/config/permissions';

export function workspacePathForRole(role: AppRole | null): string {
    switch (role) {
        case 'PLATFORM_OWNER':
            return '/owner';
        case 'INSTITUTION_ADMIN':
            return '/institution';
        case 'INSTITUTION_STAFF':
            return '/staff';
        default:
            return '/signin';
    }
}
