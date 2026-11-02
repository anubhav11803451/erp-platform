type UsePaginatorProps = {
    totalItems: number;
    currentPage: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
};

export const usePaginator = ({
    totalItems,
    currentPage,
    pageSize,
    onPageChange,
    onPageSizeChange,
}: UsePaginatorProps) => {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const boundedPage = Math.min(Math.max(currentPage, 1), totalPages);
    const offset = (boundedPage - 1) * pageSize;
    const displayRange = {
        start: totalItems === 0 ? 0 : offset + 1,
        end: Math.min(offset + pageSize, totalItems),
    };

    const handleNext = () => {
        if (boundedPage < totalPages) {
            onPageChange(boundedPage + 1);
        }
    };

    const handlePrevious = () => {
        if (boundedPage > 1) {
            onPageChange(boundedPage - 1);
        }
    };

    const handlePageSizeChange = (newPageSize: number) => {
        onPageSizeChange(newPageSize);
    };

    return {
        offset,
        currentPage: boundedPage,
        pageSize,
        totalPages,
        displayRange,
        handleNext,
        handlePrevious,
        handlePageSizeChange,
    };
};
