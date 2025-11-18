import { NAV_ITEMS } from '@/config/permissions';
import { useRoleAccess } from './use-role-access';

export function useFilteredNavItems({ showDashboard }: { showDashboard?: boolean } = {}) {
    const { hasRole } = useRoleAccess();

    return NAV_ITEMS.filter((item) => {
        const hasAccess = hasRole(item.allowedRoles);
        const dashboardCheck = showDashboard
            ? item.href === '/dashboard'
            : item.href !== '/dashboard';
        return hasAccess && dashboardCheck;
    });
}
