import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination';
// import { useScopedI18n } from '@/locales/client';

import { Flex } from '../ui/flex';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

import { usePaginator } from './use-paginator';

type PaginatorProps = {
    totalItems: number;
    currentPage: number;
    pageSize: number;
    pageSizeOptions?: number[];
    onPageChange: (page: number) => void;
    onPageSizeChange: (rowsPerPage: number) => void;
};

export const Paginator = ({
    totalItems,
    currentPage,
    pageSize,
    pageSizeOptions = [10, 20, 50],
    onPageChange,
    onPageSizeChange,
}: PaginatorProps) => {
    const {
        displayRange: { start, end },
        currentPage: boundedPage,
        totalPages,
        pageSize: activePageSize,
        handleNext,
        handlePrevious,
        handlePageSizeChange,
    } = usePaginator({ totalItems, currentPage, pageSize, onPageChange, onPageSizeChange });
    // const scopedT = useScopedI18n('paginator');
    return (
        <Pagination className="justify-end gap-4">
            <Flex alignItems="center" gap={0.5}>
                <span className="text-neutral-4/75 text-sm">Rows per page:</span>
                <Select
                    value={activePageSize.toString()}
                    onValueChange={(value) => handlePageSizeChange(Number(value))}
                >
                    <SelectTrigger className="w-fit p-2">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {pageSizeOptions.map((size) => (
                            <SelectItem key={size} value={size.toString()}>
                                {size}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </Flex>
            <PaginationContent>
                <PaginationItem>
                    <span className="text-neutral-4/75">
                        {start} - {end} of {totalItems}
                    </span>
                </PaginationItem>

                <PaginationItem>
                    <button
                        type="button"
                        aria-label="Previous page"
                        className="enabled:hover:bg-neutral-6/20 flex items-center justify-center rounded-xl p-1.5 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={handlePrevious}
                        disabled={boundedPage === 1}
                    >
                        <ChevronLeft className="size-6" />
                    </button>
                </PaginationItem>

                <PaginationItem>
                    <button
                        type="button"
                        aria-label="Next page"
                        className="enabled:hover:bg-neutral-6/20 flex items-center justify-center rounded-xl p-1.5 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={handleNext}
                        disabled={boundedPage === totalPages}
                    >
                        <ChevronRight className="size-6" />
                    </button>
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
};
