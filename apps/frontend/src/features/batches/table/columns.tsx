'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { EnrichedBatch } from '@/features/batches/batches-api-slice';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowUpDown, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Define the action handler props
type GetColumnsProps = {
    onEdit: (batch: EnrichedBatch) => void;
    onDelete: (batchId: string) => void;
};

export const getColumns = ({ onEdit, onDelete }: GetColumnsProps): ColumnDef<EnrichedBatch>[] => [
    {
        accessorKey: 'name',
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
                Batch Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => <div className="px-3 font-medium">{row.original.name}</div>,
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
            return tutor ? (
                `${tutor.first_name} ${tutor.last_name}`
            ) : (
                <span className="text-muted-foreground">Unassigned</span>
            );
        },
    },
    {
        accessorKey: 'start_date',
        header: 'Start Date',
        cell: ({ row }) => new Date(row.original.start_date).toLocaleDateString(),
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const batch = row.original;
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
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onEdit(batch)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Batch
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => onDelete(batch.id)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Batch
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];
