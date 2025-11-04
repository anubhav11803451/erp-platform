import { Link, useLocation } from 'react-router';
import { Users, BookMarked, LayoutDashboard } from 'lucide-react';

import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar'; // Assuming you have run `npx shadcn-ui add sidebar`

import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth/auth-slice';
import { UserRole } from '@erp/common/enums';
import { cn } from '@/lib/utils';

// Navigation items definition (unchanged)
const navItems = [
    {
        href: '/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        role: [UserRole.ADMIN, UserRole.STAFF],
    },
    {
        href: '/students',
        label: 'Students',
        icon: Users,
        role: [UserRole.ADMIN],
    },
    {
        href: '/batches',
        label: 'Batches',
        icon: BookMarked,
        role: [UserRole.ADMIN],
    },
    {
        href: '/users',
        label: 'Staffs (Tutors)',
        icon: Users,
        role: [UserRole.ADMIN],
    },
    {
        href: '/attendance',
        label: 'Attendance',
        icon: BookMarked,
        role: [UserRole.STAFF],
    },
    // {
    //   href: '/payments',
    //   label: 'Payments',
    //   icon: Banknote,
    //   role: [UserRole.ADMIN],
    // },
];

/**
 * This component renders the actual navigation links
 * using the official shadcn/ui Sidebar components.
 */
export function SidebarNav() {
    const user = useAppSelector(selectCurrentUser);
    const userRole = user?.role || UserRole.STAFF;
    const { pathname } = useLocation(); // Get pathname here

    const filteredNavItems = navItems.filter(
        (item) => item.role.includes(userRole) && item.href !== '/dashboard'
    );

    return (
        <SidebarMenu>
            {filteredNavItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon; // Get icon component

                return (
                    <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                            asChild
                            variant={isActive ? 'outline' : 'default'}
                            className={cn('w-full justify-start')}
                        >
                            <Link to={item.href}>
                                <Icon className="mr-2 h-4 w-4" />
                                <span>{item.label}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                );
            })}
        </SidebarMenu>
    );
}

export function DashboardSidebarMenu() {
    const user = useAppSelector(selectCurrentUser);
    const userRole = user?.role || UserRole.STAFF;
    const { pathname } = useLocation(); // Get pathname here

    const filteredNavItems = navItems.filter((item) => item.role.includes(userRole));
    return (
        <SidebarMenu>
            {filteredNavItems
                .filter((item) => item.href === '/dashboard')
                .map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon; // Get icon component
                    return (
                        <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton
                                asChild
                                variant={isActive ? 'outline' : 'default'}
                                className={cn('w-full justify-start')}
                            >
                                <Link to={item.href}>
                                    <Icon className="mr-2 h-4 w-4" />
                                    <span>{item.label}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
        </SidebarMenu>
    );
}
