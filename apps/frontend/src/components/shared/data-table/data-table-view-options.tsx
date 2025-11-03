'use client';

import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import type { Table } from '@tanstack/react-table';
import { Eye, EyeClosed, Settings2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export function DataTableViewOptions<TData>({ table }: { table: Table<TData> }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto hidden h-8 lg:flex">
                    <Settings2 />
                    View
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                    .getAllColumns()
                    .filter(
                        (column) => typeof column.accessorFn !== 'undefined' && column.getCanHide()
                    )
                    .map((column) => {
                        return (
                            <DropdownMenuCheckboxItem
                                key={column.id}
                                className="capitalize"
                                checked={column.getIsVisible()}
                                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                            >
                                <div className="flex items-center space-x-2">
                                    {column.getIsVisible() ? (
                                        <Eye className="h-4 w-4" />
                                    ) : (
                                        <EyeClosed className="h-4 w-4" />
                                    )}
                                    <span>{column.id}</span>
                                </div>
                            </DropdownMenuCheckboxItem>
                        );
                    })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
