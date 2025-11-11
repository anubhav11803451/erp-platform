import { Link, useLocation } from 'react-router';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import type { Permission } from '@/config/permissions';

type SidebarMenuListProps = {
    items: Permission[];
};

export function SidebarMenuList({ items }: SidebarMenuListProps) {
    const { pathname } = useLocation();

    return (
        <SidebarMenu>
            {items.map(({ href, icon: Icon, label, exact }) => {
                const isActive = exact ? pathname === href : pathname.startsWith(href);
                return (
                    <SidebarMenuItem key={href}>
                        <SidebarMenuButton
                            asChild
                            variant={isActive ? 'outline' : 'default'}
                            className={cn('w-full justify-start')}
                        >
                            <Link to={href}>
                                <Icon className="mr-2 h-4 w-4" />
                                <span>{label}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                );
            })}
        </SidebarMenu>
    );
}
