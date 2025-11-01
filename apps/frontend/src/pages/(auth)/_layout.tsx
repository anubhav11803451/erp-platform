import { useAppSelector } from '@/app/hooks';
import { ModeToggle } from '@/components/theme-toggle';
import { Container } from '@/components/ui/container';
import { Flex } from '@/components/ui/flex';
import { FlexItem } from '@/components/ui/flex-item';
import { selectIsAuthenticated, selectIsAuthLoading } from '@/features/auth/auth-slice';
import { Loader } from 'lucide-react';
// import { Typography } from '@/components/ui/typography';
import { Navigate, Outlet } from 'react-router';

export default function AuthLayout() {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const isAuthLoading = useAppSelector(selectIsAuthLoading);
    if (isAuthLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <Loader className="text-primary size-4 animate-spin" />
            </div>
        );
    }

    if (isAuthenticated) {
        // User is logged in, redirect them to the app's home page
        return <Navigate to="/" replace />;
    }
    return (
        <Container fullScreen>
            <Flex
                direction="column"
                alignItems="center"
                justifyContent="center"
                fullHeight
                className="p-4"
            >
                <FlexItem className="absolute top-4 right-4">
                    <ModeToggle />
                </FlexItem>
                <Outlet />
            </Flex>
        </Container>
    );
}
