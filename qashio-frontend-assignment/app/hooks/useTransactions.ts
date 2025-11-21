import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  apiClient,
  Transaction,
  CreateTransactionDto,
  UpdateTransactionDto,
} from '@/lib/api';


export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...transactionKeys.lists(), filters] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
};


export function useTransactions() {
  return useQuery({
    queryKey: transactionKeys.lists(),
    queryFn: async () => {
      console.log('useTransactions: Fetching transactions');
      const data = await apiClient.getTransactions();
      console.log('useTransactions: Fetched transactions', data);
      return data;
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}


export function useTransaction(id: string) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => apiClient.getTransaction(id),
    enabled: !!id,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTransactionDto) => {
      console.log('useCreateTransaction: Creating transaction', data);
      return apiClient.createTransaction(data);
    },
    onSuccess: (data) => {
      console.log('useCreateTransaction: Transaction created successfully', data);
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.refetchQueries({ queryKey: transactionKeys.lists() });
    },
    onError: (error) => {
      console.error('useCreateTransaction: Error creating transaction', error);
    },
  });
}


export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionDto }) =>
      apiClient.updateTransaction(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: transactionKeys.detail(variables.id),
      });
    },
  });
}


export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
    },
  });
}

