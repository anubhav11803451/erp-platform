import { ChevronLeft, ChevronRight } from "lucide-react";

import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { useScopedI18n } from "@/locales/client";

import { Flex } from "../ui/flex";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

import { usePaginator } from "./use-paginator";

type PaginatorProps = {
    totalItems: number;
    pageSizeOptions?: number[];
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (rowsPerPage: number) => void;
};

export const Paginator = ({
    totalItems,
    pageSizeOptions = [10, 20, 50],
    onPageChange,
    onPageSizeChange,
}: PaginatorProps) => {
    const {
        displayRange: { start, end },
        currentPage,
        totalPages,
        pageSize,
        handleNext,
        handlePrevious,
        handlePageSizeChange,
    } = usePaginator({
        totalItems,
        initialPage: 1,
        initialPageSize: 10,
    });
    const scopedT = useScopedI18n("paginator");
    return (
        <Pagination className="justify-end gap-4">
            <Flex alignItems="center" gap={0.5}>
                <span className="text-sm text-neutral-4/75">{scopedT("rowsPerPage")}</span>
                <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => {
                        handlePageSizeChange(Number(value));
                        onPageSizeChange?.(Number(value));
                    }}
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
                        {start} - {end} {scopedT("of")} {totalItems}
                    </span>
                </PaginationItem>

                <PaginationItem>
                    <button
                        className="flex items-center justify-center rounded-xl p-1.5 hover:cursor-pointer enabled:hover:bg-neutral-6/20 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => {
                            handlePrevious();
                            onPageChange?.(currentPage - 1);
                        }}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="size-6" />
                    </button>
                </PaginationItem>

                <PaginationItem>
                    <button
                        className="flex items-center justify-center rounded-xl p-1.5 hover:cursor-pointer enabled:hover:bg-neutral-6/20 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => {
                            handleNext();
                            onPageChange?.(currentPage + 1);
                        }}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight className="size-6" />
                    </button>
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
};
