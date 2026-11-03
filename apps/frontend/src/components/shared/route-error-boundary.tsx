import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRoleAccess } from '@/hooks/use-role-access';
import { workspacePathForRole } from '@/lib/utils/workspace-path';

export function RouteErrorBoundary() {
    const error = useRouteError();
    const { role } = useRoleAccess();
    const isNotFound = isRouteErrorResponse(error) && error.status === 404;

    return (
        <main className="bg-background text-foreground flex min-h-dvh items-center justify-center px-4 py-10">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <AlertTriangle aria-hidden="true" className="text-destructive size-6" />
                    <CardTitle>
                        {isNotFound ? 'Page not found' : 'This page ran into a problem'}
                    </CardTitle>
                    <CardDescription>
                        {isNotFound
                            ? 'The page you requested is not available.'
                            : 'We could not display this page. You can try again or return to your workspace.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 sm:flex-row">
                    <Button type="button" onClick={() => window.location.reload()}>
                        <RefreshCw aria-hidden="true" />
                        Try again
                    </Button>
                    <Button asChild variant="outline">
                        <Link to={workspacePathForRole(role)}>
                            <Home aria-hidden="true" />
                            Go to my workspace
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </main>
    );
}
