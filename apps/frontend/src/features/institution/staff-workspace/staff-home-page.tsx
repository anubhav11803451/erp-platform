import { Link } from 'react-router';
import { CalendarCheck2, ClipboardList } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatGroupType } from '../groups/group-formatters';
import {
    EmptyState,
    LoadingState,
    PageHeading,
    RequestError,
} from '@/features/institution/shared/workspace-ui';
import { WorkspaceGate } from '@/components/shared/workspace-gate';
import { useStaffWorkspace } from '@/hooks/institution/staff-workspace/use-staff-workspace';

export function StaffHomePage() {
    const { user, groups, context, assignedGroups, institutionName } = useStaffWorkspace();

    return (
        <WorkspaceGate allowedRoles={['INSTITUTION_STAFF']}>
            <section className="space-y-6">
                <PageHeading
                    title="My groups"
                    description="Work only with the groups currently assigned to you."
                />
                <Card>
                    <CardHeader>
                        <CardTitle>Institution context</CardTitle>
                        <CardDescription>
                            Staff access is limited to assigned groups. Backend authorization
                            remains authoritative for every operation.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-2">
                        <div>
                            <p className="text-muted-foreground text-sm">Institution</p>
                            <p className="font-medium">{institutionName}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm">Signed in as</p>
                            <p className="font-medium break-all">
                                {user?.identity_kind === 'INSTITUTION_STAFF'
                                    ? user.account.email
                                    : 'Not available'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                {groups.isLoading && <LoadingState label="Loading your assigned groups…" />}
                {groups.isError && (
                    <RequestError
                        error={groups.error}
                        title="Assigned groups could not be loaded"
                        onRetry={() => void groups.refetch()}
                    />
                )}
                {context.isError && (
                    <RequestError
                        error={context.error}
                        title="Institution context could not be loaded"
                        onRetry={() => void context.refetch()}
                    />
                )}
                {!groups.isLoading && !groups.isError && assignedGroups.length === 0 && (
                    <EmptyState
                        title="No groups assigned"
                        description="Ask your Institution Admin to assign one or more groups. No roster or attendance data is available until then."
                    />
                )}
                <div className="grid gap-4 lg:grid-cols-2">
                    {assignedGroups.map((group) => (
                        <Card key={group.id}>
                            <CardHeader>
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="space-y-1">
                                        <CardTitle>{group.name}</CardTitle>
                                        <CardDescription>
                                            {formatGroupType(group.type)}
                                        </CardDescription>
                                    </div>
                                    <Badge variant="outline">{formatGroupType(group.type)}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="grid gap-2 sm:grid-cols-2">
                                <Button asChild variant="outline" className="w-full">
                                    <Link to={`/staff/students?group=${group.id}`}>
                                        <ClipboardList aria-hidden="true" />
                                        Open roster
                                    </Link>
                                </Button>
                                <Button asChild className="w-full">
                                    <Link to={`/staff/attendance?group=${group.id}`}>
                                        <CalendarCheck2 aria-hidden="true" />
                                        Open attendance
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        </WorkspaceGate>
    );
}
