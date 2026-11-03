import { Link } from 'react-router';
import {
    ArrowRight,
    BookOpenCheck,
    Building2,
    CalendarCheck2,
    ClipboardList,
    Users,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { AppRouteHandle } from '@/lib/route-breadcrumbs';
import { WorkspaceGate } from '@/components/shared/workspace-gate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInstitutionOverview } from '@/hooks/institution/overview/use-institution-overview';

// eslint-disable-next-line react-refresh/only-export-components
export const institutionOverviewHandle = {
    breadcrumb: 'Overview',
} satisfies AppRouteHandle;

const tasks = [
    {
        title: 'Groups',
        description: 'Create and maintain Institution groups.',
        href: '/institution/groups',
        icon: Users,
    },
    {
        title: 'Students',
        description: 'Maintain the roster and group membership.',
        href: '/institution/students',
        icon: ClipboardList,
    },
    {
        title: 'Attendance',
        description: 'Record daily attendance by group.',
        href: '/institution/attendance',
        icon: CalendarCheck2,
    },
    {
        title: 'Team',
        description: 'Invite Staff, manage assignments, and revoke access.',
        href: '/institution/team',
        icon: BookOpenCheck,
    },
];

export function InstitutionOverviewPage() {
    const { profile, institution, account } = useInstitutionOverview();

    return (
        <WorkspaceGate allowedRoles={['INSTITUTION_ADMIN']}>
            <section aria-labelledby="institution-overview-title" className="space-y-6">
                <header className="space-y-2">
                    <p className="text-muted-foreground text-sm font-medium">
                        Institution workspace
                    </p>
                    <h1
                        id="institution-overview-title"
                        className="text-2xl font-semibold tracking-tight sm:text-3xl"
                    >
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
                            Workspace identity is provided by your Institution Admin membership.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {institution && account ? (
                            <dl className="grid gap-5 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <dt className="text-muted-foreground text-sm">Institution</dt>
                                    <dd className="font-medium">
                                        {profile.data?.name ?? institution.name}
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
                                    <dd className="font-medium break-all">{account.email}</dd>
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

                <section aria-labelledby="institution-tasks-title" className="space-y-3">
                    <div className="space-y-1">
                        <h2 id="institution-tasks-title" className="text-lg font-semibold">
                            Institution tasks
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            Choose a task to continue. No operational metrics are shown here.
                        </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {tasks.map(({ title, description, href, icon: Icon }) => (
                            <Card key={href}>
                                <CardHeader className="grid-cols-[auto_1fr] items-center gap-3">
                                    <Icon aria-hidden="true" className="text-primary size-5" />
                                    <div className="min-w-0 space-y-1">
                                        <CardTitle>{title}</CardTitle>
                                        <CardDescription>{description}</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {title === 'Attendance' && profile.isError ? (
                                        <Alert variant="destructive">
                                            <AlertTitle>Timezone status unavailable</AlertTitle>
                                            <AlertDescription className="gap-2">
                                                <p>
                                                    Attendance stays disabled until the Institution
                                                    timezone is confirmed.
                                                </p>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => void profile.refetch()}
                                                >
                                                    Retry
                                                </Button>
                                            </AlertDescription>
                                        </Alert>
                                    ) : title === 'Attendance' &&
                                      (profile.isLoading || !profile.data?.timezone) ? (
                                        <>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full"
                                                disabled
                                            >
                                                {profile.isLoading
                                                    ? 'Checking timezone…'
                                                    : 'Attendance unavailable'}
                                            </Button>
                                            <p className="text-muted-foreground text-sm">
                                                Set the Institution timezone before recording
                                                attendance.{' '}
                                                <Link
                                                    to="/institution/profile"
                                                    className="text-primary underline underline-offset-4"
                                                >
                                                    Open Institution profile
                                                </Link>
                                            </p>
                                        </>
                                    ) : (
                                        <Button asChild variant="outline" className="w-full">
                                            <Link to={href}>
                                                Open {title.toLowerCase()}
                                                <ArrowRight aria-hidden="true" />
                                            </Link>
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                        <Card>
                            <CardHeader className="grid-cols-[auto_1fr] items-center gap-3">
                                <Building2 aria-hidden="true" className="text-primary size-5" />
                                <div className="min-w-0 space-y-1">
                                    <CardTitle>Institution profile</CardTitle>
                                    <CardDescription>
                                        Update the Institution name and attendance timezone.
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Button asChild variant="outline" className="w-full">
                                    <Link to="/institution/profile">
                                        Open profile <ArrowRight aria-hidden="true" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </section>
        </WorkspaceGate>
    );
}
