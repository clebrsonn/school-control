import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { PageResponse } from '../types/PageResponse.ts';

interface UseCrudManagerProps<T, CreateDto = any, UpdateDto = any> {
  entityName: string;
  fetchPage: (page: number, size: number) => Promise<PageResponse<T>>; // adapt as needed
  createItem: (data: CreateDto) => Promise<T>;
  updateItem?: (id: string, data: UpdateDto) => Promise<T>;
  deleteItem: (id: string) => Promise<void>;
  pageSize?: number;
}

export function useCrudManager<T, CreateDto = any, UpdateDto = any>({
  entityName,
  fetchPage,
  createItem,
  updateItem,
  deleteItem,
  pageSize = 10
}: UseCrudManagerProps<T, CreateDto, UpdateDto>) {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(0);

  const {
    data: pageData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [entityName, currentPage, pageSize],
    queryFn: () => fetchPage(currentPage, pageSize),
    keepPreviousData: true
  });

  const createMutation = useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entityName] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entityName] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: updateItem || (() => Promise.resolve() as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entityName] });
    }
  });

  return {
    pageData,
    isLoading,
    error,
    currentPage,
    setCurrentPage,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    refetch
  };
}

