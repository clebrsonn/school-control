import { useCallback, useState } from 'react';
import { PageResponse } from '../types/PageResponse';

interface UsePaginationProps {
  initialPage?: number;
  initialPageSize?: number;
}

interface UsePaginationResult<T> {
  currentPage: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  handlePageChange: (page: number) => void;
  paginationState: {
    currentPage: number;
    pageSize: number;
  };
  createEmptyPageResponse: () => PageResponse<T>;
}

export function usePagination<T>({
  initialPage = 0,
  initialPageSize = 10,
}: UsePaginationProps = {}): UsePaginationResult<T> {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page - 1); // Convert from 1-based to 0-based
  }, []);

  const createEmptyPageResponse = useCallback((): PageResponse<T> => {
    return {
      content: [],
      pageable: { pageNumber: currentPage, pageSize },
      totalElements: 0,
      totalPages: 0,
      last: true,
      size: pageSize,
      number: currentPage,
    };
  }, [currentPage, pageSize]);

  return {
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    handlePageChange,
    paginationState: {
      currentPage,
      pageSize,
    },
    createEmptyPageResponse,
  };
}