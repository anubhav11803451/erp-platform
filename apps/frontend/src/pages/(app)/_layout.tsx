import { Navigate, Outlet } from 'react-router';
import { useAppSelector } from '@/app/hooks';
import {
    selectIsAuthenticated,
    selectIsAuthLoading, // <-- Import the new selector
} from '@/features/auth/auth-slice';
import { Loader } from 'lucide-react'; // <-- Import a loader
import { Container } from '@/components/ui/container';

/**
 * This is the layout file for the (app) group.
 * It now waits for the initial auth check to complete.
 */
const AppLayout = () => {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const isAuthLoading = useAppSelector(selectIsAuthLoading); // <-- Get the loading state

    // 1. If we are still trying to log in, show a loader
    if (isAuthLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <Loader className="text-primary size-4 animate-spin" />
            </div>
        );
    }

    // 2. If we are done loading AND not auth'd, redirect
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 3. If we are done loading AND auth'd, show the app
    return (
        <Container id="app-protected-layout" fullScreen>
            <Outlet />
        </Container>
    );
};

export default AppLayout;
