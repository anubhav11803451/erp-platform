import { Link, useLocation } from 'react-router';
import { LayoutDashboard, LogOut } from 'lucide-react';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import Brand from '../shared/brand';
import { Typography } from '../ui/typography';

/**
 * This component renders the DESKTOP sidebar.
 */
export function AppSidebar() {
    const { handleLogout } = useAuth();
    const { pathname } = useLocation();

    return (
        // Use the shadcn Sidebar component
        <Sidebar variant="inset" collapsible="icon" className="hidden h-full md:visible">
            <SidebarHeader>
                <SidebarMenu>
                    <Link to="/owner">
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg">
                                <Brand className="mr-0 aspect-square size-8 rounded-lg [&>span]:hidden [&>svg]:mr-0" />
                                <Typography as="span" variant="large" weight="bold">
                                    ERP360
                                </Typography>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </Link>
                </SidebarMenu>
            </SidebarHeader>
            {/* --- Content --- */}
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Platform</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    variant={pathname.startsWith('/owner') ? 'outline' : 'default'}
                                    className={cn('w-full justify-start')}
                                >
                                    <Link to="/owner">
                                        <LayoutDashboard className="mr-2 h-4 w-4" />
                                        <span>Platform workspace</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarSeparator />
            {/* --- Footer (Optional) --- */}
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={handleLogout}
                            variant="default"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive-foreground justify-center-safe"
                        >
                            {/* <Button variant="destructive"> */}
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                            {/* </Button> */}
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
