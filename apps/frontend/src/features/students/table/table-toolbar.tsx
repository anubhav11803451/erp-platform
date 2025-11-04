'use client';

import type { Table } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Flex } from '@/components/ui/flex';
import { DataTableViewOptions } from '@/components/shared/data-table/data-table-view-options';
import { FlexItem } from '@/components/ui/flex-item';

type DataTableToolbarProps<TData> = {
    table: Table<TData>;
    onAddStudentClick: () => void;
};

export function DataTableToolbar<TData>({
    table,
    onAddStudentClick,
}: DataTableToolbarProps<TData>) {
    return (
        <Flex alignItems="center" justifyContent="between" className="w-full">
            <Flex alignItems="center" className="flex-1 space-x-2">
                <Input
                    placeholder="Filter by name..."
                    value={(table.getColumn('first_name')?.getFilterValue() as string) ?? ''}
                    onChange={(event) =>
                        table.getColumn('first_name')?.setFilterValue(event.target.value)
                    }
                    className="h-8 w-[150px] lg:w-[250px]"
                />
                {/* We can add more filters here (e.g., a select for 'batch') */}
            </Flex>
            <FlexItem inline>
                <DataTableViewOptions table={table} />
                <Button size="sm" className="ml-4 h-8" onClick={onAddStudentClick}>
                    <PlusCircle className="h-4 w-4" />
                    Add Student
                </Button>
            </FlexItem>
        </Flex>
    );
}
