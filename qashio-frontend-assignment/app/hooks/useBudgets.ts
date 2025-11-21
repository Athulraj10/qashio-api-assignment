import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  apiClient,
  Budget,
  BudgetWithSpending,
  CreateBudgetDto,
  UpdateBudgetDto,
} from '@/lib/api';

export const budgetKeys = {
  all: ['budgets'] as const,
  lists: () => [...budgetKeys.all, 'list'] as const,
  list: (withSpending?: boolean) =>
    [...budgetKeys.lists(), withSpending] as const,
  details: () => [...budgetKeys.all, 'detail'] as const,
  detail: (id: string, withSpending?: boolean) =>
    [...budgetKeys.details(), id, withSpending] as const,
};

export function useBudgets(withSpending = false) {
  return useQuery({
    queryKey: budgetKeys.list(withSpending),
    queryFn: () => apiClient.getBudgets(withSpending),
    refetchOnWindowFocus: true,
  });
}

export function useBudget(id: string, withSpending = false) {
  return useQuery({
    queryKey: budgetKeys.detail(id, withSpending),
    queryFn: () => apiClient.getBudget(id, withSpending),
    enabled: !!id,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBudgetDto) => apiClient.createBudget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBudgetDto }) =>
      apiClient.updateBudget(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: budgetKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
    },
  });
}

