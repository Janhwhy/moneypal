import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { request } from '../api/client';
import type { Category } from '../api/types';

export function useCategories() {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => request<Category[]>('/categories'),
  });

  const createCategoryMutation = useMutation({
    mutationFn: (newCategory: { name: string; emoji: string }) =>
      request<Category>('/categories', {
        method: 'POST',
        body: JSON.stringify(newCategory),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, ...updates }: { id: number; name?: string; emoji?: string; sort_order?: number; is_active?: boolean }) =>
      request<Category>(`/categories/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) =>
      request<Category>(`/categories/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  return {
    categories: categoriesQuery.data || [],
    isLoading: categoriesQuery.isLoading,
    error: categoriesQuery.error,
    createCategory: createCategoryMutation.mutateAsync,
    updateCategory: updateCategoryMutation.mutateAsync,
    deleteCategory: deleteCategoryMutation.mutateAsync,
  };
}
