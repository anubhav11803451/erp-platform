import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { InstitutionGroupResponse, InstitutionStudentResponse } from '@erp/shared';
import { DataTable } from '@/components/ui/data-table';
import { DataTableColumnHeader } from '@/components/shared/data-table/data-table-header';
import { Button } from '@/components/ui/button';
import { Flex } from '@/components/ui/flex';
import { Typography } from '@/components/ui/typography';
import { StudentCard } from './student-entries';

export function StudentsTable({
    students,
    groups,
    staff,
    selectedStudentId,
    selectedStudent,
    onStatus,
    onToggleStudent,
    onCloseStudent,
}: {
    students: InstitutionStudentResponse[];
    groups: InstitutionGroupResponse[];
    staff: boolean;
    selectedStudentId: string | null;
    selectedStudent?: InstitutionStudentResponse;
    onStatus: (message: string) => void;
    onToggleStudent: (studentId: string) => void;
    onCloseStudent: () => void;
}) {
    const columns = useMemo<ColumnDef<InstitutionStudentResponse, unknown>[]>(
        () => [
            {
                accessorKey: 'display_name',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Student" />,
                cell: ({ row }) => (
                    <span className="font-medium whitespace-normal">
                        {row.original.display_name}
                    </span>
                ),
            },
            {
                accessorKey: 'local_id',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Local ID" />,
                cell: ({ row }) => row.original.local_id ?? 'Not provided',
            },
            {
                id: 'groups',
                accessorFn: (student) =>
                    groups
                        .filter((group) => student.group_ids.includes(group.id))
                        .map((group) => group.name)
                        .join(', '),
                header: ({ column }) => <DataTableColumnHeader column={column} title="Groups" />,
                cell: ({ row }) => {
                    const groupNames = groups
                        .filter((group) => row.original.group_ids.includes(group.id))
                        .map((group) => group.name);
                    return groupNames.join(', ') || 'No active groups';
                },
            },
            {
                id: 'actions',
                enableSorting: false,
                enableHiding: false,
                header: () => <span className="sr-only">Actions</span>,
                cell: ({ row }) => {
                    const isSelected = selectedStudentId === row.original.id;
                    return (
                        <Button
                            type="button"
                            variant="outline"
                            aria-expanded={isSelected}
                            aria-controls="student-details-panel"
                            onClick={() => onToggleStudent(row.original.id)}
                        >
                            {isSelected ? 'Close details' : 'Manage student'}
                        </Button>
                    );
                },
            },
        ],
        [groups, onToggleStudent, selectedStudentId]
    );

    return (
        <section aria-label="Student roster" className="space-y-4">
            <DataTable
                ariaLabel="Student roster"
                columns={columns}
                data={students}
                renderMobileRow={(row) => (
                    <StudentCard
                        student={row.original}
                        groups={groups}
                        staff={staff}
                        onStatus={onStatus}
                        idScope="mobile"
                    />
                )}
            />
            <div id="student-details-panel" hidden={!selectedStudent} className="space-y-3">
                {selectedStudent && (
                    <>
                        <Flex
                            id="student-details-heading"
                            alignItems="center"
                            justifyContent="between"
                            wrap
                            className="gap-2"
                        >
                            <Typography as="h2" variant="large">
                                Manage {selectedStudent.display_name}
                            </Typography>
                            <Button type="button" variant="outline" onClick={onCloseStudent}>
                                Close details
                            </Button>
                        </Flex>
                        <StudentCard
                            student={selectedStudent}
                            groups={groups}
                            staff={staff}
                            onStatus={onStatus}
                            idScope="desktop"
                        />
                    </>
                )}
            </div>
        </section>
    );
}
