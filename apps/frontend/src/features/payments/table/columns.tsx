'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { EnrichedPayment } from '@erp/shared';
import { HideIfNoAccess } from '@/components/role-bac/hide-if-no-access';

// Define the shape of the actions props
type PaymentActionsProps = {
    onEdit: (payment: EnrichedPayment) => void;
    onDelete: (paymentId: string) => void;
};

export const getPaymentColumns = ({
    onEdit,
    onDelete,
}: PaymentActionsProps): ColumnDef<EnrichedPayment>[] => [
    {
        accessorKey: 'payment_date',
        header: 'Date',
        cell: ({ row }) => {
            return new Date(row.getValue('payment_date')).toLocaleDateString();
        },
    },
    {
        accessorKey: 'amount',
        header: 'Amount (₹)',
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('amount'));
            const formatted = new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
            }).format(amount);
            return <div className="font-medium">{formatted}</div>;
        },
    },
    {
        accessorKey: 'batch.name',
        header: 'For Batch',
        cell: ({ row }) => row.original.batch.name,
    },
    {
        accessorKey: 'method',
        header: 'Method',
    },
    {
        accessorKey: 'notes',
        header: 'Notes',
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const payment = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <HideIfNoAccess feature="PAYMENT.EDIT">
                            <DropdownMenuItem onClick={() => onEdit(payment)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Payment
                            </DropdownMenuItem>
                        </HideIfNoAccess>
                        <HideIfNoAccess feature="PAYMENT.DELETE">
                            <DropdownMenuItem
                                onClick={() => onDelete(payment.id)}
                                variant="destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Payment
                            </DropdownMenuItem>
                        </HideIfNoAccess>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
