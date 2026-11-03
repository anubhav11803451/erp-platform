import { UserPlus } from 'lucide-react';
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
import { StudentCreateForm } from './student-entries';
import { StudentsTable } from './students-table';
import {
    EmptyState,
    LoadingState,
    PageHeading,
    RequestError,
} from '@/features/institution/shared/workspace-ui';
import { WorkspaceGate } from '@/components/shared/workspace-gate';
import { useInstitutionStudents } from '@/hooks/institution/students/use-institution-students';

export function StudentsPage() {
    const {
        search,
        showCreate,
        statusMessage,
        selectedStudentId,
        selectedStudent,
        activeGroups,
        isInstitutionStaff,
        groupId,
        groupsQuery,
        query,
        students,
        isRosterLoading,
        setStatusMessage,
        setGroup,
        setSearch,
        toggleCreate,
        openCreate,
        toggleStudent,
        closeStudent,
    } = useInstitutionStudents();
    const { isLoading: isGroupsLoading, error: groupsError, isError: groupsFailed } = groupsQuery;

    return (
        <WorkspaceGate allowedRoles={['INSTITUTION_ADMIN', 'INSTITUTION_STAFF']}>
            <section className="space-y-6">
                <PageHeading
                    title="Students"
                    description={
                        isInstitutionStaff
                            ? 'View and update student names and local IDs in your assigned groups.'
                            : 'Search the Institution roster, manage group membership, and maintain student details.'
                    }
                    actions={
                        !isInstitutionStaff ? (
                            <Button type="button" onClick={toggleCreate} aria-expanded={showCreate}>
                                <UserPlus aria-hidden="true" />
                                {showCreate ? 'Close form' : 'Add student'}
                            </Button>
                        ) : undefined
                    }
                />
                {statusMessage && (
                    <p role="status" aria-live="polite" className="text-sm">
                        {statusMessage}
                    </p>
                )}
                {showCreate && !isInstitutionStaff && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Add student to roster</CardTitle>
                            <CardDescription>
                                Only display name and optional local ID are collected.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <StudentCreateForm groups={activeGroups} onStatus={setStatusMessage} />
                        </CardContent>
                    </Card>
                )}
                <Card>
                    <CardHeader>
                        <CardTitle>Roster filters</CardTitle>
                        <CardDescription>
                            {isInstitutionStaff
                                ? 'Group choices are limited to your current assignments.'
                                : 'Filter by group and search the Institution roster.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="roster-group">Group</Label>
                            <Select
                                value={groupId || 'all'}
                                onValueChange={setGroup}
                                disabled={isGroupsLoading || activeGroups.length === 0}
                            >
                                <SelectTrigger id="roster-group" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {!isInstitutionStaff && (
                                        <SelectItem value="all">All groups</SelectItem>
                                    )}
                                    {activeGroups.map((group) => (
                                        <SelectItem key={group.id} value={group.id}>
                                            {group.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="roster-search">Search roster</Label>
                            <Input
                                id="roster-search"
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Student name or local ID"
                                aria-describedby="roster-search-help"
                            />
                            <p id="roster-search-help" className="text-muted-foreground text-xs">
                                Search applies only within the selected group when one is selected.
                            </p>
                        </div>
                    </CardContent>
                </Card>
                {groupsFailed && (
                    <RequestError
                        error={groupsError}
                        title="Group list could not be loaded"
                        onRetry={() => void groupsQuery.refetch()}
                    />
                )}
                {isGroupsLoading && <LoadingState label="Loading groups…" />}
                {isInstitutionStaff &&
                    !isGroupsLoading &&
                    !groupsFailed &&
                    activeGroups.length === 0 && (
                        <EmptyState
                            title="No groups assigned"
                            description="Ask an Institution Admin to assign you to a group before viewing student records."
                        />
                    )}
                {isRosterLoading && <LoadingState label="Loading roster…" />}
                {query.isError && (
                    <RequestError
                        error={query.error}
                        title="Roster could not be loaded"
                        onRetry={() => void query.refetch()}
                    />
                )}
                {!isRosterLoading && !query.isError && groupId && students.length === 0 && (
                    <EmptyState
                        title={search ? 'No matching students' : 'No students in this group'}
                        description={
                            search
                                ? 'Try another name or local ID, or clear the search.'
                                : isInstitutionStaff
                                  ? 'This assigned group has no active students.'
                                  : 'Add a student or choose another group.'
                        }
                        action={
                            !search && !isInstitutionStaff ? (
                                <Button type="button" variant="outline" onClick={openCreate}>
                                    Add student
                                </Button>
                            ) : undefined
                        }
                    />
                )}
                {!isInstitutionStaff &&
                    !groupId &&
                    !isGroupsLoading &&
                    !isRosterLoading &&
                    !query.isError &&
                    students.length === 0 && (
                        <EmptyState
                            title={search ? 'No matching students' : 'Roster is empty'}
                            description={
                                search
                                    ? 'Try another name or local ID.'
                                    : 'Add a student to begin building the Institution roster.'
                            }
                        />
                    )}
                {students.length > 0 && (
                    <StudentsTable
                        students={students}
                        groups={activeGroups}
                        staff={isInstitutionStaff}
                        selectedStudentId={selectedStudentId}
                        selectedStudent={selectedStudent}
                        onStatus={setStatusMessage}
                        onToggleStudent={toggleStudent}
                        onCloseStudent={closeStudent}
                    />
                )}
            </section>
        </WorkspaceGate>
    );
}
