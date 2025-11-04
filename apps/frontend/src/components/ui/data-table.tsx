'use client';

import * as React from 'react';
import type {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
} from '@tanstack/react-table';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';

import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { DataTablePagination } from '../shared/data-table/data-table-pagination';
import { cn } from '@/lib/utils';

type DataTableProps<TData, TValue> = {
    // NEW: Add hideColumns prop to hide specific columns by default
    className?: string;
    hideColumns?: (keyof TData)[];
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    /**
     * NEW: The toolbar is now a function that receives the table instance.
     * This gives the toolbar access to table state (e.g., table.getColumn()).
     */
    toolbar: (table: ReturnType<typeof useReactTable<TData>>) => React.ReactNode;
};

export function DataTable<TData, TValue>({
    className,
    hideColumns,
    columns,
    data,
    toolbar,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
        ...(hideColumns
            ? hideColumns.reduce(
                  (acc, column) => {
                      acc[column as string] = false;
                      return acc;
                  },
                  { id: false } as { [key: string]: boolean }
              )
            : { id: false }),
    });
    const [rowSelection, setRowSelection] = React.useState({});

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    return (
        <div className="w-full space-y-4">
            <div id="data-table-wrapper" className={cn('rounded-md border', className)}>
                {toolbar && (
                    <div id="data-table-toolbar-wrapper" className="mx-4 my-6">
                        {toolbar(table)}
                    </div>
                )}
                <Table id="data-table" className="border-collapse border-spacing-y-2">
                    {/* --- Table --- */}
                    <TableHeader id="data-table-header" className="bg-muted/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="bg-muted/50 rounded-t-md">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            className="pl-4 first:rounded-tl-[inherit] last:rounded-tr-[inherit]"
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef.header,
                                                      header.getContext()
                                                  )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="pl-4">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            // --- Empty State ---
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    {/* --- Pagination --- */}
                    <TableFooter className="bg-muted/50 rounded-b-md">
                        <TableRow className="hover:bg-muted/50 rounded-[inherit]">
                            <TableCell
                                colSpan={columns.length}
                                className="bg-muted/50 rounded-[inherit]"
                            >
                                <DataTablePagination table={table} />
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
        </div>
    );
}
