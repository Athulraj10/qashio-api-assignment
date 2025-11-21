import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export const summaryKeys = {
  all: ['summary'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...summaryKeys.all, 'list', filters] as const,
};

export function useSummary(filters?: {
  startDate?: string;
  endDate?: string;
  type?: 'income' | 'expense';
}) {
  return useQuery({
    queryKey: summaryKeys.list(filters),
    queryFn: () => apiClient.getTransactionsSummary(filters),
    refetchOnWindowFocus: true,
  });
}

