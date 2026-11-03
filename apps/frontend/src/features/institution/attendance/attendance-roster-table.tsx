import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { InstitutionAttendanceDayResponse } from '@erp/shared';
import { DataTableSearch } from '@/components/shared/data-table/data-table-search';
import { DataTableColumnHeader } from '@/components/shared/data-table/data-table-header';
import { DataTable } from '@/components/ui/data-table';
import { Card, CardContent } from '@/components/ui/card';
import { Grid } from '@/components/ui/grid';
import { Typography } from '@/components/ui/typography';
import { AttendanceMarkField } from './attendance-mark-field';

type AttendanceEntry = InstitutionAttendanceDayResponse['entries'][number];

export function AttendanceRosterTable({
    entries,
    disabled,
}: {
    entries: AttendanceEntry[];
    disabled: boolean;
}) {
    const columns = useMemo<ColumnDef<AttendanceEntry, unknown>[]>(
        () => [
            {
                accessorKey: 'display_name',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Student" />,
                cell: ({ row }) => (
                    <div className="space-y-1">
                        <Typography as="p" variant="small">
                            {row.original.display_name}
                        </Typography>
                        {row.original.local_id && (
                            <Typography as="p" variant="muted">
                                Local ID: {row.original.local_id}
                            </Typography>
                        )}
                    </div>
                ),
            },
            {
                accessorKey: 'local_id',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Local ID" />,
                cell: ({ row }) => row.original.local_id ?? '',
            },
            {
                id: 'attendance',
                enableSorting: false,
                enableHiding: false,
                header: () => <span>Attendance status</span>,
                cell: ({ row }) => (
                    <AttendanceMarkField
                        name={`marks.${row.index}.status`}
                        studentName={row.original.display_name}
                        disabled={disabled}
                    />
                ),
            },
        ],
        [disabled]
    );

    return (
        <DataTable
            ariaLabel="Attendance roster"
            columns={columns}
            data={entries}
            hideColumns={['local_id']}
            toolbar={(table) => (
                <DataTableSearch
                    table={table}
                    label="Search attendance roster"
                    placeholder="Search student name or local ID"
                />
            )}
            renderMobileRow={(row) => (
                <Card>
                    <CardContent className="py-4">
                        <Grid
                            id={`attendance-mobile-entry-${row.id}`}
                            columns={1}
                            className="gap-3"
                        >
                            <div>
                                <Typography as="h3" variant="small">
                                    {row.original.display_name}
                                </Typography>
                                {row.original.local_id && (
                                    <Typography as="p" variant="muted">
                                        Local ID: {row.original.local_id}
                                    </Typography>
                                )}
                            </div>
                            <AttendanceMarkField
                                name={`marks.${row.index}.status`}
                                studentName={row.original.display_name}
                                disabled={disabled}
                            />
                        </Grid>
                    </CardContent>
                </Card>
            )}
        />
    );
}
