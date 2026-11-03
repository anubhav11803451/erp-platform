import type { Table } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';

export function DataTableSearch<TData>({
    table,
    label,
    placeholder,
}: {
    table: Table<TData>;
    label: string;
    placeholder: string;
}) {
    return (
        <Input
            type="search"
            aria-label={label}
            placeholder={placeholder}
            value={String(table.getState().globalFilter ?? '')}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            onKeyDown={(event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                }
            }}
            className="w-full sm:max-w-sm"
        />
    );
}
