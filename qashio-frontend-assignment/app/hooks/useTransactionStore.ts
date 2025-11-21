'use client';

import { create } from 'zustand';

export interface TransactionFilters {
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  };
  searchTerm: string;
}

const initialFilters: TransactionFilters = {
  dateRange: {
    startDate: null,
    endDate: null,
  },
  searchTerm: '',
};

interface TransactionState {
  filters: TransactionFilters;
  setDateRange: (startDate: Date | null, endDate: Date | null) => void;
  setSearchTerm: (term: string) => void;
  resetFilters: () => void;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  filters: initialFilters,

  setDateRange: (startDate, endDate) =>
    set((state) => ({
      filters: {
        ...state.filters,
        dateRange: { startDate, endDate },
      },
    })),

  setSearchTerm: (searchTerm) =>
    set((state) => ({
      filters: {
        ...state.filters,
        searchTerm,
      },
    })),

  resetFilters: () => set({ filters: initialFilters }),
})); 