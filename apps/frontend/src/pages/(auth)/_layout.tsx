import { Link, Navigate, Outlet } from 'react-router';
import { Loader, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Flex } from '@/components/ui/flex';
import { Container } from '@/components/ui/container';
import { FlexItem } from '@/components/ui/flex-item';
import { ModeToggle } from '@/components/theme-toggle';

/**
 * This is the shared layout for the (auth) group (e.g., /signin, /signup).
 * It provides:
 * 1. Auth Guard: Redirects logged-in users to the dashboard.
 * 2. Visual Layout: A full-screen, centered container for the auth forms.
 */
const AuthLayout = () => {
    const { isAuthenticated, isAuthLoading } = useAuth();

    // if (isAuthLoading) {
    //     return (
    //         <div className="flex h-screen w-screen items-center justify-center">
    //             <Loader className="text-primary h-10 w-10 animate-spin" />
    //         </div>
    //     );
    // }

    if (isAuthenticated) {
        // User is logged in, redirect them to the app's home page
        return <Navigate to="/" replace />;
    }

    // User is not logged in, show the auth page (login, register, etc.)
    // This <Outlet> will render the signin, signup, or forgot-password page.
    return (
        <Container id="auth-protected-layout" fullScreen>
            <Flex
                direction="column"
                alignItems="center"
                justifyContent="center"
                fullHeight
                className="p-4"
            >
                <FlexItem className="absolute top-8 left-8">
                    <Link to="/" className="text-foreground flex items-center text-lg font-bold">
                        <Globe className="text-primary mr-2 h-5 w-5" />
                        ERP360
                    </Link>
                </FlexItem>
                <FlexItem className="absolute top-8 right-8">
                    <ModeToggle />
                </FlexItem>
                <Outlet />
            </Flex>
        </Container>
    );
};

export default AuthLayout;
