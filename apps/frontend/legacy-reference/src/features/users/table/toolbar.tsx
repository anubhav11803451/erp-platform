import type { Table } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { DataTableViewOptions } from '@/components/shared/data-table/data-table-view-options';
// (We will add column filtering/view options later if needed)

type DataTableToolbarProps<TData> = {
    table: Table<TData>;
    onAddUserClick: () => void;
};

export function DataTableToolbar<TData>({ table, onAddUserClick }: DataTableToolbarProps<TData>) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                <Input
                    placeholder="Filter by email..."
                    value={(table.getColumn('email')?.getFilterValue() as string) ?? ''}
                    onChange={(event) =>
                        table.getColumn('email')?.setFilterValue(event.target.value)
                    }
                    className="h-8 w-[150px] lg:w-[250px]"
                />
            </div>
            <DataTableViewOptions table={table} />
            <Button size="sm" className="ml-4 h-8" onClick={onAddUserClick}>
                <PlusCircle className="h-4 w-4" />
                Add Staff
            </Button>
        </div>
    );
}
