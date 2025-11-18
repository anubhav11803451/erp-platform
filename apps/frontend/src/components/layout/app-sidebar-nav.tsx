import { SidebarMenuList } from './sidebar-menulist';
import { useFilteredNavItems } from '@/hooks/use-filter-nav-items';

export function SidebarNav() {
    const items = useFilteredNavItems({ showDashboard: false });
    return <SidebarMenuList items={items} />;
}

export function DashboardSidebarMenu() {
    const items = useFilteredNavItems({ showDashboard: true });
    return <SidebarMenuList items={items} />;
}
