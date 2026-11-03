'use client';

import * as React from 'react';
import type {
    ColumnDef,
    ColumnFiltersState,
    Row,
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
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { DataTablePagination } from '../shared/data-table/data-table-pagination';
import { cn } from '@/lib/utils';

type DataTableProps<TData, TValue> = {
    className?: string;
    hideColumns?: (keyof TData)[];
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    ariaLabel: string;
    renderMobileRow?: (row: Row<TData>) => React.ReactNode;
    // The toolbar can access table state, including column filters and visibility.
    toolbar?: (table: ReturnType<typeof useReactTable<TData>>) => React.ReactNode | null;
};

export function DataTable<TData, TValue>({
    className,
    hideColumns,
    columns,
    data,
    ariaLabel,
    renderMobileRow,
    toolbar,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = React.useState('');
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
            globalFilter,
            columnVisibility,
            rowSelection,
        },
        onGlobalFilterChange: setGlobalFilter,
    });

    return (
        <div className="w-full space-y-4">
            <div className={cn('rounded-md border', className)}>
                {toolbar && <div className="mx-4 my-6">{toolbar(table)}</div>}
                <div className={renderMobileRow ? 'hidden md:block' : undefined}>
                    <Table aria-label={ariaLabel} className="border-collapse border-spacing-y-2">
                        <TableHeader className="bg-muted/50">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="bg-muted/50 rounded-t-md">
                                    {headerGroup.headers.map((header) => (
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
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.length ? (
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
                                <TableRow>
                                    <TableCell
                                        colSpan={table.getVisibleLeafColumns().length}
                                        className="h-24 text-center"
                                    >
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                {renderMobileRow && (
                    <div
                        role="list"
                        aria-label={`${ariaLabel} cards`}
                        className="space-y-3 p-3 md:hidden"
                    >
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <div key={row.id} role="listitem">
                                    {renderMobileRow(row)}
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground py-6 text-center text-sm">
                                No results.
                            </p>
                        )}
                    </div>
                )}
                <div className="border-t px-3">
                    <DataTablePagination table={table} />
                </div>
            </div>
        </div>
    );
}
