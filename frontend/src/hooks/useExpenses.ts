import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { request } from '../api/client';
import type { Expense, Summary, CategorySpend, MonthSpend } from '../api/types';

export function useExpenses(filters?: { range?: string; categoryId?: number; start?: string; end?: string }) {
  const queryClient = useQueryClient();
  const getExpensesQueryKey = ['expenses', filters];

  const expensesQuery = useQuery<Expense[]>({
    queryKey: getExpensesQueryKey,
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters?.range) params.append('range', filters.range);
      if (filters?.categoryId) params.append('category_id', String(filters.categoryId));
      if (filters?.start) params.append('start', filters.start);
      if (filters?.end) params.append('end', filters.end);
      const queryStr = params.toString();
      return request<Expense[]>(`/expenses${queryStr ? `?${queryStr}` : ''}`);
    },
  });

  const createExpenseMutation = useMutation({
    mutationFn: (newExpense: { category_id: number; amount: number; payment_method: 'debit' | 'credit' | 'cash' | string; note?: string; occurred_at?: string }) =>
      request<Expense>('/expenses', {
        method: 'POST',
        body: JSON.stringify(newExpense),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, ...updates }: { id: number; category_id?: number; amount?: number; payment_method?: 'debit' | 'credit' | 'cash' | string; note?: string | null; occurred_at?: string }) =>
      request<Expense>(`/expenses/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (id: number) =>
      request<Expense>(`/expenses/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  return {
    expenses: expensesQuery.data || [],
    isLoading: expensesQuery.isLoading,
    error: expensesQuery.error,
    createExpense: createExpenseMutation.mutateAsync,
    updateExpense: updateExpenseMutation.mutateAsync,
    deleteExpense: deleteExpenseMutation.mutateAsync,
  };
}

export function useAnalytics(period: string = 'month') {
  const summaryQuery = useQuery<Summary>({
    queryKey: ['analytics', 'summary', period],
    queryFn: () => request<Summary>(`/analytics/summary?period=${period}`),
  });

  const categorySpendQuery = useQuery<CategorySpend[]>({
    queryKey: ['analytics', 'by-category', period],
    queryFn: () => request<CategorySpend[]>(`/analytics/by-category?period=${period}`),
  });

  return {
    summary: summaryQuery.data,
    isSummaryLoading: summaryQuery.isLoading,
    categorySpend: categorySpendQuery.data || [],
    isCategorySpendLoading: categorySpendQuery.isLoading,
  };
}

export function useMonthlySpend(year?: number) {
  const monthlySpendQuery = useQuery<MonthSpend[]>({
    queryKey: ['analytics', 'by-month', year],
    queryFn: () => request<MonthSpend[]>(`/analytics/by-month${year ? `?year=${year}` : ''}`),
  });

  return {
    monthlySpend: monthlySpendQuery.data || [],
    isLoading: monthlySpendQuery.isLoading,
  };
}
