import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { request } from '../api/client';
import type { Setting } from '../api/types';

export function useSettings() {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery<Setting>({
    queryKey: ['settings'],
    queryFn: () => request<Setting>('/settings'),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (updates: { monthly_budget?: number; currency?: string }) =>
      request<Setting>('/settings', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  return {
    settings: settingsQuery.data || { id: 1, monthly_budget: 10000, currency: 'INR' },
    isLoading: settingsQuery.isLoading,
    error: settingsQuery.error,
    updateSettings: updateSettingsMutation.mutateAsync,
  };
}
