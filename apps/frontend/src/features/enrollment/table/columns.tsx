'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { EnrolledStudent } from '../enrollment-api-slice';
import { Checkbox } from '@/components/ui/checkbox';

// Define the shape of the actions props
type EnrolledStudentActionsProps = {
    onDisEnroll: (studentId: string) => void;
};

export const getColumns = ({
    onDisEnroll,
}: EnrolledStudentActionsProps): ColumnDef<EnrolledStudent>[] => [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => `${row.original.student.first_name} ${row.original.student.last_name}`,
    },

    {
        accessorKey: 'student.guardian.first_name',
        header: 'Guardian',
        cell: ({ row }) =>
            `${row.original.student.guardian.first_name} ${row.original.student.guardian.last_name}`,
    },
    {
        accessorKey: 'total_fee_agreed',
        header: 'Agreed Fee (₹)',
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('total_fee_agreed'));
            const formatted = new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
            }).format(amount);
            return <div className="font-medium">{formatted}</div>;
        },
    },
    {
        accessorKey: 'join_date',
        header: 'Enrolled On',
        cell: ({ row }) => {
            return new Date(row.getValue('join_date')).toLocaleDateString();
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const enrollment = row.original;
            return (
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
                        <DropdownMenuItem>View Student</DropdownMenuItem>
                        <DropdownMenuItem>Add Payment</DropdownMenuItem>
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onDisEnroll(enrollment.studentId)}
                        >
                            Disenroll Student
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
