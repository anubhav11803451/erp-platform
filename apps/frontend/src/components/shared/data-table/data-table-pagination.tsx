import { useId } from 'react';
import type { Table } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Flex } from '@/components/ui/flex';
import { FlexItem } from '@/components/ui/flex-item';
import { Grid } from '@/components/ui/grid';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Typography } from '@/components/ui/typography';

type DataTablePaginationProps<TData> = {
    table: Table<TData>;
};

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
    const id = useId();
    const totalRows = table.getFilteredRowModel().rows.length;
    const pageSize = table.getState().pagination.pageSize;
    const pageIndex = table.getState().pagination.pageIndex;
    const pageRows = table.getRowModel().rows.length;
    const firstRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
    const lastRow = Math.min(firstRow + pageRows - 1, totalRows);
    const pageCount = table.getPageCount();

    return (
        <Grid
            id={`data-table-pagination-${id}`}
            columns={1}
            className="items-center gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto]"
        >
            <FlexItem id={`data-table-pagination-range-${id}`}>
                <Typography as="p" variant="muted" aria-live="polite">
                    Showing {firstRow}-{lastRow} of {totalRows} results
                </Typography>
            </FlexItem>
            <Flex
                id={`data-table-pagination-controls-${id}`}
                alignItems="center"
                wrap
                justifyContent="between"
                className="gap-4 sm:justify-end"
            >
                <FlexItem id={`data-table-page-size-item-${id}`}>
                    <Flex id={`data-table-page-size-${id}`} alignItems="center" className="gap-2">
                        <Typography as="span" variant="small">
                            Rows per page
                        </Typography>
                        <Select
                            value={`${pageSize}`}
                            onValueChange={(value) => {
                                table.setPageSize(Number(value));
                            }}
                        >
                            <SelectTrigger className="h-8 w-17.5">
                                <SelectValue placeholder={pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 25, 30, 40, 50].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Flex>
                </FlexItem>
                <FlexItem id={`data-table-page-number-${id}`} className="w-25 text-center">
                    <Typography as="span" variant="small">
                        Page {pageCount === 0 ? 0 : pageIndex + 1} of {pageCount}
                    </Typography>
                </FlexItem>
                <Flex id={`data-table-page-navigation-${id}`} alignItems="center" className="gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="hidden size-8 lg:flex"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">Go to first page</span>
                        <ChevronsLeft />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">Go to previous page</span>
                        <ChevronLeft />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">Go to next page</span>
                        <ChevronRight />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="hidden size-8 lg:flex"
                        onClick={() => table.setPageIndex(Math.max(pageCount - 1, 0))}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">Go to last page</span>
                        <ChevronsRight />
                    </Button>
                </Flex>
            </Flex>
        </Grid>
    );
}
