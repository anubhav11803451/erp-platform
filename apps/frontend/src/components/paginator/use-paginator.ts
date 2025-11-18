import { useMemo, useState } from "react";

type UsePaginatorProps = {
    totalItems: number;
    initialPage?: number;
    initialPageSize?: number;
};

export const usePaginator = ({
    totalItems,
    initialPage = 1,
    initialPageSize = 10,
}: UsePaginatorProps) => {
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [pageSize, setPageSize] = useState(initialPageSize);

    const totalPages = Math.ceil(totalItems / pageSize);

    const { offset } = useMemo(() => {
        return {
            offset: (currentPage - 1) * pageSize,
        };
    }, [currentPage, pageSize]);

    const displayRange = useMemo(() => {
        const start = offset + 1; // Adjusted to start from 1
        const end = Math.min(offset + pageSize, totalItems);
        return { start, end };
    }, [offset, pageSize, totalItems]);

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setCurrentPage(1); // Reset to first page
    };

    return {
        offset,
        currentPage,
        pageSize,
        totalPages,
        displayRange,
        handleNext,
        handlePrevious,
        handlePageSizeChange,
    };
};
