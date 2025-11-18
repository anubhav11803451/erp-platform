'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { ExternalLink, MoreHorizontal, PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { EnrolledStudent } from '@erp/shared';
import { Checkbox } from '@/components/ui/checkbox';
import { HideIfNoAccess } from '@/components/role-bac/hide-if-no-access';
import { formatDate } from '@/lib/utils';

// Define the shape of the actions props
type EnrolledStudentActionsProps = {
    onViewStudent: (studentId: string) => void;
    onAddPayment: (studentId: string) => void;
    onDisEnroll: (studentId: string) => void;
};

export const getColumns = ({
    onViewStudent,
    onAddPayment,
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
            return formatDate(row.getValue('join_date'));
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
                        <DropdownMenuItem onClick={() => onViewStudent(enrollment.studentId)}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Student
                        </DropdownMenuItem>
                        <HideIfNoAccess feature="PAYMENT.ADD">
                            <DropdownMenuItem onClick={() => onAddPayment(enrollment.studentId)}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Payment
                            </DropdownMenuItem>
                        </HideIfNoAccess>
                        <HideIfNoAccess feature="STUDENT.DISENROLL">
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() => onDisEnroll(enrollment.studentId)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Disenroll Student
                            </DropdownMenuItem>
                        </HideIfNoAccess>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
