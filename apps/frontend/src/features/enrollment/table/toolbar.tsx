'use client';

import type { Table } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Flex } from '@/components/ui/flex';
import { DataTableViewOptions } from '@/components/shared/data-table/data-table-view-options';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';

type DataTableToolbarProps<TData> = {
    table: Table<TData>;
    onEnrollClick: () => void;
    onUnenrollSelectedClick: () => void;
};

export function DataTableToolbar<TData>({
    table,
    onEnrollClick,
    onUnenrollSelectedClick,
}: DataTableToolbarProps<TData>) {
    const numSelected = table.getFilteredSelectedRowModel().rows.length;
    return (
        <Flex alignItems="center" justifyContent="between" fullWidth>
            <Flex alignItems="center" className="flex-1 space-x-2">
                {numSelected > 0 ? (
                    <Button
                        variant="destructive"
                        size="sm"
                        className="h-8"
                        onClick={onUnenrollSelectedClick}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete ({numSelected}) selected
                    </Button>
                ) : (
                    <Input
                        placeholder="Filter by student name..."
                        // This now targets our new 'name' column
                        value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                        onChange={(event) =>
                            table.getColumn('name')?.setFilterValue(event.target.value)
                        }
                        className="h-8 w-[150px] lg:w-[250px]"
                    />
                )}
            </Flex>
            <DataTableViewOptions table={table} />

            <Button size="sm" className="ml-4 h-8" onClick={onEnrollClick}>
                <PlusCircle className="h-4 w-4" />
                Enroll Student
            </Button>
        </Flex>
    );
}
