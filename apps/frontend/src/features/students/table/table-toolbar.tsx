'use client';

import type { Table } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

type DataTableToolbarProps<TData> = {
    table: Table<TData>;
    onAddStudentClick: () => void;
};

export function DataTableToolbar<TData>({
    table,
    onAddStudentClick,
}: DataTableToolbarProps<TData>) {
    return (
        <div className="flex w-full items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                <Input
                    placeholder="Filter by name..."
                    value={(table.getColumn('first_name')?.getFilterValue() as string) ?? ''}
                    onChange={(event) =>
                        table.getColumn('first_name')?.setFilterValue(event.target.value)
                    }
                    className="h-8 w-[150px] lg:w-[250px]"
                />
                {/* We can add more filters here (e.g., a select for 'batch') */}
            </div>
            <Button size="sm" className="h-8" onClick={onAddStudentClick}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Student
            </Button>
        </div>
    );
}
