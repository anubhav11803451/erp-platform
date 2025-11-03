import { Link } from 'react-router';
import { Globe } from 'lucide-react';
import { SidebarNav } from './app-sidebar-nav';

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Flex } from '../ui/flex';

/**
 * This component renders the DESKTOP sidebar.
 */
export function AppSidebar() {
    return (
        // Use the shadcn Sidebar component
        <Sidebar variant="inset" collapsible="icon" className="hidden h-full md:visible">
            <SidebarHeader>
                <SidebarMenu>
                    <Link to="/">
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg">
                                <Flex
                                    className="aspect-square size-8 rounded-lg"
                                    justifyContent="center"
                                    alignItems="center"
                                >
                                    <Globe className="h-5 w-5" />
                                </Flex>
                                <span>ERP360</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </Link>
                </SidebarMenu>
            </SidebarHeader>
            {/* --- Content --- */}
            <SidebarContent className="flex flex-col">
                {/* --- Main Navigation (from shared component) --- */}
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarNav />
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            {/* --- Footer (Optional) --- */}
            {/* <SidebarFooter></SidebarFooter> */}
        </Sidebar>
    );
}
