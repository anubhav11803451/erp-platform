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

type DataTableProps<TData, TValue> = {
    // NEW: Add hideColumns prop to hide specific columns by default

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
                  {} as { [key: string]: boolean }
              )
            : {}),
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
            {/* THIS IS THE FIX: 
        We now call the toolbar function and pass the table instance.
        This ensures the toolbar never gets a 'null' table.
      */}
            <div className="rounded-md border">
                <div className="mx-4 my-6">{toolbar(table)}</div>
                <Table id="data-table" className="border-collapse border-spacing-y-2">
                    {/* --- Table --- */}
                    <TableHeader id="data-table-header" className="bg-muted/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="bg-muted/50 rounded-t-md">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            className="first:rounded-tl-[inherit] last:rounded-tr-[inherit]"
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
                                        <TableCell key={cell.id}>
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
                    <TableFooter className="rounded-b-md bg-transparent">
                        <TableRow className="rounded-[inherit] hover:bg-none">
                            <TableCell
                                colSpan={columns.length}
                                className="rounded-[inherit] bg-transparent"
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
