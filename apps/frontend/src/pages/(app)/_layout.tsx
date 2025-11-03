import { Navigate, Outlet } from 'react-router';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthenticated, selectIsAuthLoading } from '@/features/auth/auth-slice';
import { Loader } from 'lucide-react';

import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Flex } from '@/components/ui/flex';

/**
 * This is the main layout for the protected (app) group.
 * It provides the full dashboard UI (Sidebar, Header)
 * AND protects the routes.
 */
const AppLayout = () => {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const isAuthLoading = useAppSelector(selectIsAuthLoading);

    // 1. If we are still trying to log in, show a full-screen loader
    if (isAuthLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <Loader className="text-primary h-10 w-10 animate-spin" />
            </div>
        );
    }

    // 2. If we are done loading AND not auth'd, redirect to signin
    if (!isAuthenticated) {
        // Redirect to the landing page (which will show the signin button)
        // or directly to '/signin'
        return <Navigate to="/signin" replace />;
    }

    // 3. If we are done loading AND auth'd, show the app layout
    return (
        <SidebarProvider>
            {/* --- Desktop Sidebar --- */}
            <AppSidebar />
            {/* --- Main Content Area --- */}
            <SidebarInset>
                {/* --- Header (with Mobile Nav) --- */}
                <AppHeader />

                {/* --- Page Content --- */}
                <Flex direction="column" className="flex-1 gap-4 p-4 pt-0">
                    <Outlet />
                </Flex>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default AppLayout;
