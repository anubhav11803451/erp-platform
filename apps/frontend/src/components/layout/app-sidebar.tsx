import { Link } from 'react-router';
import { LogOut } from 'lucide-react';
import { DashboardSidebarMenu, SidebarNav } from './app-sidebar-nav';

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
import Brand from '../shared/brand';
import { Typography } from '../ui/typography';

/**
 * This component renders the DESKTOP sidebar.
 */
export function AppSidebar() {
    const { handleLogout } = useAuth();
    return (
        // Use the shadcn Sidebar component
        <Sidebar variant="inset" collapsible="icon" className="hidden h-full md:visible">
            <SidebarHeader>
                <SidebarMenu>
                    <Link to="/">
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
                {/* --- Main Navigation (from shared component) --- */}
                <SidebarGroup className="mt-6">
                    <SidebarGroupContent>
                        <DashboardSidebarMenu />
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarNav />
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
