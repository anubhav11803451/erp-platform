import { useMemo } from 'react';
import { Link } from 'react-router';
import { Archive, CalendarCheck2, ClipboardList, Pencil, Save, X } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { institutionGroupCreateRequestSchema, type InstitutionGroupResponse } from '@erp/shared';
import { SmartForm } from '@/components/smart-form';
import { SelectField, TextField } from '@/components/smart-form/form-fields';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTableSearch } from '@/components/shared/data-table/data-table-search';
import { DataTableColumnHeader } from '@/components/shared/data-table/data-table-header';
import { Flex } from '@/components/ui/flex';
import { FlexItem } from '@/components/ui/flex-item';
import { Grid } from '@/components/ui/grid';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Typography } from '@/components/ui/typography';
import {
    EmptyState,
    LoadingState,
    PageHeading,
    RequestError,
} from '@/features/institution/shared/workspace-ui';
import { WorkspaceGate } from '@/components/shared/workspace-gate';
import { useInstitutionGroups } from '@/hooks/institution/groups/use-institution-groups';
import { formatGroupType } from './group-formatters';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectGroupsUi, setGroupsStatusMessage, setSelectedGroupId } from './groups-ui-slice';
import {
    useInstitutionGroupArchive,
    useInstitutionGroupEditor,
} from '@/hooks/institution/groups/use-institution-group-actions';

function GroupEditor({
    group,
    onStatus,
    idScope = 'group',
}: {
    group?: InstitutionGroupResponse;
    onStatus?: (message: string) => void;
    idScope?: string;
}) {
    const { message, editing, setEditing, isBusy, submit, cancel } = useInstitutionGroupEditor(
        group,
        onStatus
    );
    const controlPrefix = `${idScope}-${group?.id ?? 'new'}`;
    const formId = `group-form-${controlPrefix}`;

    if (group && !editing) {
        return (
            <Button type="button" variant="outline" onClick={() => setEditing(true)}>
                <Pencil aria-hidden="true" />
                Edit group
            </Button>
        );
    }

    return (
        <SmartForm
            key={group?.id ?? 'new'}
            id={formId}
            schema={institutionGroupCreateRequestSchema}
            defaultValues={{
                name: group?.name ?? '',
                type: group?.type ?? 'SCHOOL_SECTION',
            }}
            onSubmit={submit}
            noValidate
            showSubmitButton={false}
            className="grid gap-3 sm:grid-cols-2"
        >
            <fieldset disabled={isBusy} className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
                <TextField
                    name="name"
                    idPrefix={controlPrefix}
                    label="Group name"
                    description="Use a name that Staff and students will recognize."
                    required
                    disabled={isBusy}
                />
                <SelectField
                    name="type"
                    idPrefix={controlPrefix}
                    label="Group type"
                    options={[
                        { value: 'SCHOOL_SECTION', label: 'School section' },
                        { value: 'COACHING_BATCH', label: 'Coaching batch' },
                    ]}
                    disabled={isBusy}
                />
            </fieldset>
            {message && (
                <p role="alert" className="text-destructive text-sm sm:col-span-2">
                    {message}
                </p>
            )}
            <div className="flex flex-wrap gap-2 sm:col-span-2">
                <Button type="submit" form={formId} disabled={isBusy}>
                    <Save aria-hidden="true" />
                    {isBusy ? 'Saving…' : group ? 'Save group' : 'Add group'}
                </Button>
                {group && (
                    <Button type="button" variant="outline" disabled={isBusy} onClick={cancel}>
                        <X aria-hidden="true" />
                        Cancel
                    </Button>
                )}
            </div>
        </SmartForm>
    );
}

function GroupCard({
    group,
    onStatus,
    idScope,
}: {
    group: InstitutionGroupResponse;
    onStatus: (message: string) => void;
    idScope: string;
}) {
    const { archive, archiveState, confirmOpen, setConfirmOpen, error } =
        useInstitutionGroupArchive(group, onStatus);

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                        <CardTitle>{group.name}</CardTitle>
                        <CardDescription>{formatGroupType(group.type)}</CardDescription>
                    </div>
                    <Badge variant="outline">{formatGroupType(group.type)}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && (
                    <Alert variant="destructive">
                        <AlertTitle>Archive failed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                <GroupEditor group={group} onStatus={onStatus} idScope={idScope} />
                <div className="flex flex-wrap gap-2 border-t pt-4">
                    <Button asChild variant="outline" className="flex-1">
                        <Link to={`/institution/students?group=${group.id}`}>
                            <ClipboardList aria-hidden="true" />
                            Roster
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1">
                        <Link to={`/institution/attendance?group=${group.id}`}>
                            <CalendarCheck2 aria-hidden="true" />
                            Attendance
                        </Link>
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setConfirmOpen(true)}
                        disabled={archiveState.isLoading}
                    >
                        <Archive aria-hidden="true" />
                        Archive
                    </Button>
                </div>
                <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Archive {group.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This removes the group from active operations. Existing roster and
                                attendance history is retained.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col sm:flex-row">
                            <AlertDialogCancel disabled={archiveState.isLoading}>
                                Cancel
                            </AlertDialogCancel>
                            <Button
                                type="button"
                                variant="destructive"
                                disabled={archiveState.isLoading}
                                onClick={() => void archive()}
                            >
                                {archiveState.isLoading ? 'Archiving…' : 'Archive group'}
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    );
}

export function InstitutionGroupsPage() {
    const dispatch = useAppDispatch();
    const groups = useInstitutionGroups();
    const { statusMessage, selectedGroupId } = useAppSelector(selectGroupsUi);
    const activeGroups = groups.activeGroups;
    const selectedGroup = activeGroups.find((group) => group.id === selectedGroupId);
    const setStatusMessage = (message: string) => dispatch(setGroupsStatusMessage(message));
    const columns = useMemo<ColumnDef<InstitutionGroupResponse, unknown>[]>(
        () => [
            {
                accessorKey: 'name',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Group" />,
                cell: ({ row }) => (
                    <span className="font-medium whitespace-normal">{row.original.name}</span>
                ),
            },
            {
                id: 'type',
                accessorFn: (group) => formatGroupType(group.type),
                header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
            },
            {
                id: 'actions',
                enableSorting: false,
                enableHiding: false,
                header: () => <span className="sr-only">Actions</span>,
                cell: ({ row }) => {
                    const isSelected = selectedGroupId === row.original.id;
                    return (
                        <Button
                            type="button"
                            variant="outline"
                            aria-expanded={isSelected}
                            aria-controls="group-details-panel"
                            onClick={() =>
                                dispatch(setSelectedGroupId(isSelected ? null : row.original.id))
                            }
                        >
                            {isSelected ? 'Close details' : 'Manage group'}
                        </Button>
                    );
                },
            },
        ],
        [dispatch, selectedGroupId]
    );

    return (
        <WorkspaceGate allowedRoles={['INSTITUTION_ADMIN']}>
            <section className="space-y-6">
                <PageHeading
                    title="Groups"
                    description="Create and maintain School Section or Coaching Batch groups for this Institution."
                />
                {statusMessage && (
                    <p role="status" aria-live="polite" className="text-sm">
                        {statusMessage}
                    </p>
                )}
                <Card>
                    <CardHeader>
                        <CardTitle>Add group</CardTitle>
                        <CardDescription>
                            Groups can be used to organize rosters and attendance.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <GroupEditor onStatus={setStatusMessage} idScope="create" />
                    </CardContent>
                </Card>

                <section aria-labelledby="groups-list-title" className="space-y-3">
                    <h2 id="groups-list-title" className="text-lg font-semibold">
                        Current groups
                    </h2>
                    {groups.isLoading && <LoadingState label="Loading groups…" />}
                    {groups.isError && (
                        <RequestError error={groups.error} onRetry={() => void groups.refetch()} />
                    )}
                    {!groups.isLoading && !groups.isError && activeGroups.length === 0 && (
                        <EmptyState
                            title="No groups yet"
                            description="Add a group above to start organizing the roster and attendance."
                        />
                    )}
                    {activeGroups.length > 0 && (
                        <DataTable
                            ariaLabel="Active Institution groups"
                            columns={columns}
                            data={activeGroups}
                            toolbar={(table) => (
                                <Grid
                                    id="groups-data-table-filters"
                                    columns={1}
                                    className="gap-3 sm:grid-cols-[minmax(0,1fr)_14rem]"
                                >
                                    <FlexItem id="groups-data-table-search" className="min-w-0">
                                        <DataTableSearch
                                            table={table}
                                            label="Search groups"
                                            placeholder="Search groups"
                                        />
                                    </FlexItem>
                                    <FlexItem id="groups-data-table-type-filter">
                                        <Select
                                            value={String(
                                                table.getColumn('type')?.getFilterValue() ?? 'all'
                                            )}
                                            onValueChange={(value) =>
                                                table
                                                    .getColumn('type')
                                                    ?.setFilterValue(
                                                        value === 'all' ? undefined : value
                                                    )
                                            }
                                        >
                                            <SelectTrigger
                                                className="w-full"
                                                aria-label="Filter by group type"
                                            >
                                                <SelectValue placeholder="All group types" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All group types</SelectItem>
                                                <SelectItem value="School section">
                                                    School section
                                                </SelectItem>
                                                <SelectItem value="Coaching batch">
                                                    Coaching batch
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FlexItem>
                                </Grid>
                            )}
                            renderMobileRow={(row) => (
                                <GroupCard
                                    group={row.original}
                                    onStatus={setStatusMessage}
                                    idScope="mobile"
                                />
                            )}
                        />
                    )}
                    <div id="group-details-panel" hidden={!selectedGroup} className="space-y-3">
                        {selectedGroup && (
                            <>
                                <Flex
                                    id="group-details-heading"
                                    alignItems="center"
                                    justifyContent="between"
                                    wrap
                                    className="gap-2"
                                >
                                    <Typography as="h3" variant="large">
                                        Manage {selectedGroup.name}
                                    </Typography>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => dispatch(setSelectedGroupId(null))}
                                    >
                                        Close details
                                    </Button>
                                </Flex>
                                <GroupCard
                                    group={selectedGroup}
                                    onStatus={setStatusMessage}
                                    idScope="desktop"
                                />
                            </>
                        )}
                    </div>
                </section>
            </section>
        </WorkspaceGate>
    );
}
