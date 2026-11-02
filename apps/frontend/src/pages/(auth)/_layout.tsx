import { Link, Navigate, Outlet } from 'react-router';
import { Loader, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRoleAccess } from '@/hooks/use-role-access';
import { Flex } from '@/components/ui/flex';
import { Container } from '@/components/ui/container';
import { FlexItem } from '@/components/ui/flex-item';
import { ModeToggle } from '@/components/themes/theme-toggle';

/**
 * Shared layout for workspace authentication pages.
 */
const AuthLayout = () => {
    const { isAuthenticated, isAuthLoading } = useAuth();
    const { isInstitutionAdmin } = useRoleAccess();
    if (isAuthLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <Loader className="text-primary h-10 w-10 animate-spin" />
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to={isInstitutionAdmin ? '/institution' : '/owner'} replace />;
    }

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
