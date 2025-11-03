'use client';

import type { Table } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

type DataTableToolbarProps<TData> = {
    table: Table<TData>;
    onAddBatchClick: () => void;
};

export function DataTableToolbar<TData>({ table, onAddBatchClick }: DataTableToolbarProps<TData>) {
    return (
        <div className="flex w-full items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                <Input
                    placeholder="Filter by name..."
                    value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                    onChange={(event) =>
                        table.getColumn('name')?.setFilterValue(event.target.value)
                    }
                    className="h-8 w-[150px] lg:w-[250px]"
                />
            </div>
            <Button size="sm" className="h-8" onClick={onAddBatchClick}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Batch
            </Button>
        </div>
    );
}
