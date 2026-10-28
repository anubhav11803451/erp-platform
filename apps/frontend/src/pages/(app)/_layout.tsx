import { Navigate, Outlet, useLocation } from 'react-router';
import { AuthLoading } from '@/features/auth/auth-loading';
import { useAuth } from '@/hooks/use-auth';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Flex } from '@/components/ui/flex';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function AppLayout() {
    const location = useLocation();
    const { isAuthenticated, isAuthLoading } = useAuth();

    if (isAuthLoading) {
        return <AuthLoading />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/signin" replace state={{ from: location }} />;
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <AppHeader />
                <main id="main-content" className="flex-1">
                    <Flex direction="column" className="flex-1 gap-4 px-6">
                        <Outlet />
                    </Flex>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
