'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Copy, Edit, MoreHorizontal, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { EnrichedUser } from '../users-api-slice';
import { UserRole } from '@erp/common/enums';

// Define the shape of the actions props
type UserActionsProps = {
    onEdit: (user: EnrichedUser) => void;
    onDelete: (userId: string) => void;
};

export const getColumns = ({ onEdit, onDelete }: UserActionsProps): ColumnDef<EnrichedUser>[] => [
    {
        accessorKey: 'id',
        header: 'ID',
    },
    {
        accessorKey: 'first_name',
        header: 'First Name',
    },
    {
        accessorKey: 'last_name',
        header: 'Last Name',
    },
    {
        accessorKey: 'email',
        header: 'Email',
    },
    {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => {
            const role = row.getValue('role') as UserRole;
            return (
                <Badge variant={role === UserRole.ADMIN ? 'default' : 'secondary'}>{role}</Badge>
            );
        },
    },
    {
        accessorKey: 'created_at',
        header: 'Joined',
        cell: ({ row }) => {
            return new Date(row.getValue('created_at')).toLocaleDateString();
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const user = row.original;

            const handleCopyEmail = () => {
                navigator.clipboard.writeText(user.email);
                toast.success('Email copied to clipboard');
            };

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
                        <DropdownMenuItem onClick={handleCopyEmail}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            aria-disabled={user.role === UserRole.ADMIN}
                            disabled={user.role === UserRole.ADMIN}
                            onClick={() => onDelete(user.id)}
                            variant="destructive"
                        >
                            <Trash className="mr-2 h-4 w-4 text-inherit" />
                            Delete User
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
