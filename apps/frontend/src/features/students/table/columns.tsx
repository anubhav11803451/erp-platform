'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { EnrichedStudent } from '@/features/students/student-api-slice';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { DataTableColumnHeader } from '@/components/shared/data-table/data-table-header';

// Define the action handler props
type GetColumnsProps = {
    onEdit: (student: EnrichedStudent) => void;
    onDelete: (studentId: string) => void;
};

export const getColumns = ({ onEdit, onDelete }: GetColumnsProps): ColumnDef<EnrichedStudent>[] => [
    {
        accessorKey: 'id',
        header: 'ID',
    },
    {
        accessorKey: 'first_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
        cell: ({ row }) => (
            <div className="font-medium capitalize">{`${row.original.first_name} ${row.original.last_name}`}</div>
        ),
    },
    {
        accessorKey: 'email',
        header: 'Email',
    },
    {
        accessorKey: 'school_name',
        header: 'School',
    },
    {
        accessorKey: 'guardian.first_name',
        header: 'Guardian Name',
        cell: ({ row }) => `${row.original.guardian.first_name} ${row.original.guardian.last_name}`,
    },
    {
        accessorKey: 'guardian.email',
        header: 'Guardian Email',
    },
    {
        accessorKey: 'created_at',
        header: 'Joined on',
        cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const student = row.original;
            return (
                <div className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel className="text-muted-foreground text-xs">
                                Actions
                            </DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onEdit(student)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Student
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => onDelete(student.id)}
                                variant="destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Student
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];
