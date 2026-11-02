import { Building2 } from 'lucide-react';
import { Navigate } from 'react-router';
import { Access } from '@/components/role-bac/access';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRoleAccess } from '@/hooks/use-role-access';
import type { AppRouteHandle } from '@/lib/route-breadcrumbs';

// Route metadata is exported for the file-route lazy module.
// eslint-disable-next-line react-refresh/only-export-components
export const handle = {
    breadcrumb: 'Institution',
} satisfies AppRouteHandle;

export default function InstitutionHomePage() {
    const { user } = useRoleAccess();
    const institution = user?.identity_kind === 'INSTITUTION_ADMIN' ? user.institution : null;
    const accountEmail = user?.identity_kind === 'INSTITUTION_ADMIN' ? user.account.email : null;

    return (
        <Access feature="INSTITUTION.ACCESS" fallback={<Navigate to="/owner" replace />}>
            <section aria-labelledby="institution-page-title" className="space-y-6">
                <header className="space-y-2">
                    <p className="text-muted-foreground text-sm font-medium">
                        Institution workspace
                    </p>
                    <h1 id="institution-page-title" className="text-2xl font-semibold sm:text-3xl">
                        Overview
                    </h1>
                    <p className="text-muted-foreground">
                        Your account and the Institution associated with your access.
                    </p>
                </header>
                <Card>
                    <CardHeader>
                        <CardTitle>Account and Institution</CardTitle>
                        <CardDescription>
                            Workspace access is provided by your Institution Admin membership.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {institution ? (
                            <dl className="grid gap-5 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <dt className="text-muted-foreground text-sm">Institution</dt>
                                    <dd className="flex items-center gap-2 font-medium">
                                        <Building2
                                            aria-hidden="true"
                                            className="text-primary size-4"
                                        />
                                        {institution.name}
                                    </dd>
                                </div>
                                <div className="space-y-1">
                                    <dt className="text-muted-foreground text-sm">
                                        Institution code
                                    </dt>
                                    <dd className="font-medium">
                                        {institution.code ?? 'Not available'}
                                    </dd>
                                </div>
                                <div className="space-y-1">
                                    <dt className="text-muted-foreground text-sm">Signed in as</dt>
                                    <dd className="font-medium">{accountEmail}</dd>
                                </div>
                                <div className="space-y-1">
                                    <dt className="text-muted-foreground text-sm">
                                        Workspace role
                                    </dt>
                                    <dd className="font-medium">Institution Admin</dd>
                                </div>
                            </dl>
                        ) : (
                            <p role="status" className="text-muted-foreground">
                                Institution identity could not be confirmed. Sign in again to reload
                                your workspace.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </section>
        </Access>
    );
}
