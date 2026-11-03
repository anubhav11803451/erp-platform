import { Link } from 'react-router';
import { CalendarCheck2, Save } from 'lucide-react';
import { z } from 'zod/v4';
import { institutionAttendanceSaveRequestSchema } from '@erp/shared';
import { SmartForm } from '@/components/smart-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    EmptyState,
    LoadingState,
    PageHeading,
    RequestError,
} from '@/features/institution/shared/workspace-ui';
import { WorkspaceGate } from '@/components/shared/workspace-gate';
import { AttendanceRosterTable } from './attendance-roster-table';
import { useInstitutionAttendance } from '@/hooks/institution/attendance/use-institution-attendance';

const attendanceFormSchema = z
    .object({ marks: institutionAttendanceSaveRequestSchema.shape.marks })
    .strict();

export function AttendancePage() {
    const {
        groupsQuery,
        isInstitutionStaff,
        activeGroups,
        profile,
        staffContext,
        date,
        setDate,
        selectedGroup,
        activeGroupId,
        timezone,
        timezoneReady,
        attendance,
        attendanceData,
        saveState,
        saveMessage,
        attendanceKey,
        selectGroup,
        save,
    } = useInstitutionAttendance();

    const { isLoading: isLoadingGroups, error: groupsError, isError: hasGroupsError } = groupsQuery;

    return (
        <WorkspaceGate allowedRoles={['INSTITUTION_ADMIN', 'INSTITUTION_STAFF']}>
            <section className="space-y-6">
                <PageHeading
                    title="Attendance"
                    description="Mark each student Present, Absent, or Unmarked for one group and date."
                />
                <Card>
                    <CardHeader>
                        <CardTitle>Attendance session</CardTitle>
                        <CardDescription>
                            Select the group and date before loading its roster.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="attendance-group">Group</Label>
                            <Select
                                value={activeGroupId}
                                onValueChange={selectGroup}
                                disabled={isLoadingGroups || activeGroups.length === 0}
                            >
                                <SelectTrigger id="attendance-group" className="w-full">
                                    <SelectValue placeholder="Choose a group" />
                                </SelectTrigger>
                                <SelectContent>
                                    {activeGroups.map((group) => (
                                        <SelectItem key={group.id} value={group.id}>
                                            {group.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="attendance-date">Attendance date</Label>
                            <Input
                                id="attendance-date"
                                type="date"
                                value={date}
                                onChange={(event) => setDate(event.target.value)}
                                disabled={!timezoneReady}
                                aria-describedby="attendance-date-help"
                            />
                            <p id="attendance-date-help" className="text-muted-foreground text-xs">
                                {timezone
                                    ? `The default date follows the Institution timezone (${timezone}).`
                                    : 'Attendance stays unavailable until an Institution Admin sets the timezone.'}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {isLoadingGroups && <LoadingState label="Loading assigned groups…" />}
                {hasGroupsError && (
                    <RequestError
                        error={groupsError}
                        title="Groups could not be loaded"
                        onRetry={() => void groupsQuery.refetch()}
                    />
                )}
                {isInstitutionStaff && staffContext.isLoading && (
                    <LoadingState label="Checking Institution timezone…" />
                )}
                {isInstitutionStaff && staffContext.isError && (
                    <RequestError
                        error={staffContext.error}
                        title="Institution context could not be confirmed"
                        onRetry={() => void staffContext.refetch()}
                    />
                )}
                {isInstitutionStaff && staffContext.data && !staffContext.data.timezone && (
                    <Alert>
                        <CalendarCheck2 aria-hidden="true" />
                        <AlertTitle>Attendance is not available yet</AlertTitle>
                        <AlertDescription>
                            Ask your Institution Admin to set the Institution timezone before
                            recording attendance. The browser timezone will not be substituted.
                        </AlertDescription>
                    </Alert>
                )}
                {!isInstitutionStaff && profile.isLoading && (
                    <LoadingState label="Checking Institution timezone…" />
                )}
                {!isInstitutionStaff && profile.isError && (
                    <RequestError
                        error={profile.error}
                        title="Timezone status could not be confirmed"
                        onRetry={() => void profile.refetch()}
                    />
                )}
                {!isInstitutionStaff && profile.data && !profile.data.timezone && (
                    <Alert>
                        <CalendarCheck2 aria-hidden="true" />
                        <AlertTitle>Attendance is not available yet</AlertTitle>
                        <AlertDescription>
                            <p>
                                Set the Institution timezone before recording attendance. The
                                browser timezone will not be substituted.
                            </p>
                            <Button asChild variant="outline" className="mt-2">
                                <Link to="/institution/profile">Set Institution timezone</Link>
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}
                {!isLoadingGroups && !hasGroupsError && activeGroups.length === 0 && (
                    <EmptyState
                        title={isInstitutionStaff ? 'No groups assigned' : 'No groups available'}
                        description={
                            isInstitutionStaff
                                ? 'Ask an Institution Admin to assign you to a group.'
                                : 'Create a group before taking attendance.'
                        }
                    />
                )}

                {activeGroupId && date && timezoneReady && (
                    <section aria-labelledby="attendance-roster-title" className="space-y-3">
                        <div>
                            <h2 id="attendance-roster-title" className="text-lg font-semibold">
                                {selectedGroup?.name ?? 'Selected group'} roster
                            </h2>
                            <p className="text-muted-foreground text-sm">
                                {date} · {selectedGroup?.name ?? 'Selected group'}
                            </p>
                        </div>
                        {attendance.isLoading && (
                            <LoadingState label="Loading attendance roster…" />
                        )}
                        {attendance.isError &&
                            (isInstitutionStaff ? (
                                <Alert variant="destructive" aria-live="assertive">
                                    <AlertTitle>Attendance is unavailable</AlertTitle>
                                    <AlertDescription className="gap-3">
                                        <p>
                                            The assigned group roster could not be loaded. An
                                            Institution Admin must configure the Institution
                                            timezone before attendance can be recorded. If it is
                                            already configured, ask the Admin to verify your
                                            assignment.
                                        </p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => void attendance.refetch()}
                                        >
                                            Try again
                                        </Button>
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <RequestError
                                    error={attendance.error}
                                    title="Attendance could not be loaded"
                                    onRetry={() => void attendance.refetch()}
                                />
                            ))}
                        {saveMessage && (
                            <p
                                id="attendance-status-message"
                                role={saveMessage === 'Attendance saved.' ? 'status' : 'alert'}
                                aria-live="polite"
                                className={
                                    saveMessage === 'Attendance saved.'
                                        ? 'text-sm'
                                        : 'text-destructive text-sm'
                                }
                            >
                                {saveMessage}
                            </p>
                        )}
                        {attendanceData && attendanceData.entries.length === 0 && (
                            <EmptyState
                                title="No students in this group"
                                description="Add students to this group before taking attendance."
                            />
                        )}
                        {attendanceData && attendanceData.entries.length > 0 && (
                            <SmartForm
                                key={`${attendanceKey}:${attendanceData.entries
                                    .map((entry) => `${entry.student_id}-${entry.status ?? ''}`)
                                    .join('|')}`}
                                id="attendance-form"
                                schema={attendanceFormSchema}
                                defaultValues={{
                                    marks: attendanceData.entries.map((entry) => ({
                                        student_id: entry.student_id,
                                        status: entry.status,
                                    })),
                                }}
                                onSubmit={save}
                                noValidate
                                showSubmitButton={false}
                            >
                                {(form) => {
                                    const isDirty = form.formState.isDirty;
                                    return (
                                        <>
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                                <p
                                                    role="status"
                                                    aria-live="polite"
                                                    className="text-sm"
                                                >
                                                    {isDirty
                                                        ? 'Unsaved attendance changes.'
                                                        : 'Attendance is saved.'}
                                                </p>
                                                <Button
                                                    type="submit"
                                                    form="attendance-form"
                                                    disabled={!isDirty || saveState.isLoading}
                                                    aria-busy={saveState.isLoading}
                                                >
                                                    <Save aria-hidden="true" />
                                                    {saveState.isLoading
                                                        ? 'Saving…'
                                                        : 'Save attendance'}
                                                </Button>
                                            </div>
                                            <AttendanceRosterTable
                                                entries={attendanceData.entries}
                                                disabled={saveState.isLoading}
                                            />
                                        </>
                                    );
                                }}
                            </SmartForm>
                        )}
                    </section>
                )}
            </section>
        </WorkspaceGate>
    );
}
