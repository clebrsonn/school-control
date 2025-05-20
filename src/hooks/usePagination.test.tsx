import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { usePagination } from './usePagination';

describe('usePagination Hook', () => {
  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => usePagination());
      
      expect(result.current.currentPage).toBe(0);
      expect(result.current.pageSize).toBe(10);
      expect(result.current.paginationState).toEqual({
        currentPage: 0,
        pageSize: 10
      });
    });

    it('should initialize with provided values', () => {
      const { result } = renderHook(() => 
        usePagination({ initialPage: 2, initialPageSize: 25 })
      );
      
      expect(result.current.currentPage).toBe(2);
      expect(result.current.pageSize).toBe(25);
      expect(result.current.paginationState).toEqual({
        currentPage: 2,
        pageSize: 25
      });
    });
  });

  describe('state updates', () => {
    it('should update currentPage when setCurrentPage is called', () => {
      const { result } = renderHook(() => usePagination());
      
      act(() => {
        result.current.setCurrentPage(3);
      });
      
      expect(result.current.currentPage).toBe(3);
      expect(result.current.paginationState.currentPage).toBe(3);
    });

    it('should update pageSize when setPageSize is called', () => {
      const { result } = renderHook(() => usePagination());
      
      act(() => {
        result.current.setPageSize(50);
      });
      
      expect(result.current.pageSize).toBe(50);
      expect(result.current.paginationState.pageSize).toBe(50);
    });

    it('should convert 1-based page to 0-based when handlePageChange is called', () => {
      const { result } = renderHook(() => usePagination());
      
      act(() => {
        result.current.handlePageChange(5); // 5 in 1-based should be 4 in 0-based
      });
      
      expect(result.current.currentPage).toBe(4);
    });
  });

  describe('createEmptyPageResponse', () => {
    it('should create an empty page response with current pagination state', () => {
      const { result } = renderHook(() => 
        usePagination<string>({ initialPage: 2, initialPageSize: 15 })
      );
      
      const emptyResponse = result.current.createEmptyPageResponse();
      
      expect(emptyResponse).toEqual({
        content: [],
        pageable: { pageNumber: 2, pageSize: 15 },
        totalElements: 0,
        totalPages: 0,
        last: true,
        size: 15,
        number: 2
      });
    });

    it('should reflect updated pagination state', () => {
      const { result } = renderHook(() => usePagination<number>());
      
      act(() => {
        result.current.setCurrentPage(3);
        result.current.setPageSize(25);
      });
      
      const emptyResponse = result.current.createEmptyPageResponse();
      
      expect(emptyResponse).toEqual({
        content: [],
        pageable: { pageNumber: 3, pageSize: 25 },
        totalElements: 0,
        totalPages: 0,
        last: true,
        size: 25,
        number: 3
      });
    });
  });
});