'use client';

import type { Table } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Flex } from '@/components/ui/flex';
import { DataTableViewOptions } from '@/components/shared/data-table/data-table-view-options';
import { useFeatureAccess } from '@/hooks/use-feature-access';

type DataTableToolbarProps<TData> = {
    table: Table<TData>;
    onAddBatchClick: () => void;
};

export function DataTableToolbar<TData>({ table, onAddBatchClick }: DataTableToolbarProps<TData>) {
    const { canAccess } = useFeatureAccess();
    return (
        <Flex alignItems="center" justifyContent="between" fullWidth>
            <Flex alignItems="center" className="flex-1 space-x-2">
                <Input
                    placeholder="Filter by name..."
                    value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                    onChange={(event) =>
                        table.getColumn('name')?.setFilterValue(event.target.value)
                    }
                    className="h-8 w-[150px] lg:w-[250px]"
                />
            </Flex>
            <DataTableViewOptions table={table} />
            <Button
                size="sm"
                className="ml-4 h-8"
                onClick={onAddBatchClick}
                disabled={!canAccess('BATCH.ADD')}
            >
                <PlusCircle className="h-4 w-4" />
                Add Batch
            </Button>
        </Flex>
    );
}
