'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { EnrichedBatch } from '@erp/shared';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, LinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/shared/data-table/data-table-header';
import { Link } from 'react-router';
import { Checkbox } from '@/components/ui/checkbox';
import { HideIfNoAccess } from '@/components/role-bac/hide-if-no-access';
import { formatDate } from '@/lib/utils';

// Define the action handler props
type GetColumnsProps = {
    onEdit: (batch: EnrichedBatch) => void;
    onDelete: (batchId: string) => void;
};

export const getColumns = ({ onEdit, onDelete }: GetColumnsProps): ColumnDef<EnrichedBatch>[] => [
    {
        accessorKey: 'id',
        header: 'ID',
    },

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
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
        cell: ({ row }) => {
            const batch = row.original;
            return (
                <Button variant="link" asChild className="group p-0 font-medium">
                    <Link to={`/batches/${batch.id}`}>
                        {batch.name}
                        <LinkIcon className="group-hover:text-primary/50 ml-2" />
                    </Link>
                </Button>
            );
        },
    },
    {
        accessorKey: 'subject',
        header: 'Subject',
        cell: ({ row }) => <Badge variant="outline">{row.original.subject || 'N/A'}</Badge>,
    },
    {
        accessorKey: 'tutor',
        header: 'Tutor',
        cell: ({ row }) => {
            const tutor = row.original.tutor;
            return tutor ? `${tutor.first_name} ${tutor.last_name}` : 'Unassigned';
        },
    },
    {
        accessorKey: 'start_date',
        header: 'Start Date',
        cell: ({ row }) => {
            return formatDate(row.original.start_date);
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const batch = row.original;

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
                        <HideIfNoAccess feature="BATCH.EDIT">
                            <DropdownMenuItem onClick={() => onEdit(batch)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Batch
                            </DropdownMenuItem>
                        </HideIfNoAccess>
                        <DropdownMenuSeparator />
                        <HideIfNoAccess feature="BATCH.DELETE">
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() => onDelete(batch.id)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Batch
                            </DropdownMenuItem>
                        </HideIfNoAccess>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
