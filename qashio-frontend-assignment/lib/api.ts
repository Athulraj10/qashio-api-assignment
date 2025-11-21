
const API_BASE_URL = typeof window === 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000')
  : '/api';

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface CreateTransactionDto {
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
  description?: string;
}

export interface UpdateTransactionDto {
  amount?: number;
  category?: string;
  date?: string;
  type?: 'income' | 'expense';
  description?: string;
}

export interface CreateCategoryDto {
  name: string;
}

export enum TimePeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  timePeriod: TimePeriod;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetWithSpending extends Budget {
  currentSpending: number;
  remaining: number;
  percentageUsed: number;
}

export interface CreateBudgetDto {
  category: string;
  amount: number;
  timePeriod: TimePeriod;
  startDate?: string;
  endDate?: string;
}

export interface UpdateBudgetDto {
  category?: string;
  amount?: number;
  timePeriod?: TimePeriod;
  startDate?: string;
  endDate?: string;
}


class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;


    let token: string | null = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token');
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      });

      if (!response.ok) {
        const isAuthEndpoint = endpoint.includes('/auth/login') || endpoint.includes('/auth/register');

        if (response.status === 401 && !isAuthEndpoint) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
          throw new Error('Unauthorized - Please login again');
        }

        let errorMessage = response.statusText;
        try {
          const error = await response.json();
          errorMessage = error.message || error.error || response.statusText;
        } catch {
        }
        throw new Error(errorMessage || `HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }
      return {} as T;
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to the server. Please check if the backend is running.');
      }
      throw error;
    }
  }


  async getTransactions(filters?: {
    type?: 'income' | 'expense';
    category?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<Transaction[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    return this.request<Transaction[]>(`/transactions${queryString ? `?${queryString}` : ''}`);
  }

  async getTransactionsSummary(filters?: {
    startDate?: string;
    endDate?: string;
    type?: 'income' | 'expense';
  }): Promise<{
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    transactionCount: number;
    byCategory: Array<{ category: string; total: number; count: number }>;
    byMonth: Array<{ month: string; income: number; expenses: number }>;
  }> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.type) params.append('type', filters.type);

    const queryString = params.toString();
    return this.request(`/transactions/summary${queryString ? `?${queryString}` : ''}`);
  }

  async getTransaction(id: string): Promise<Transaction> {
    return this.request<Transaction>(`/transactions/${id}`);
  }

  async createTransaction(data: CreateTransactionDto): Promise<Transaction> {
    return this.request<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTransaction(
    id: string,
    data: UpdateTransactionDto
  ): Promise<Transaction> {
    return this.request<Transaction>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTransaction(id: string): Promise<void> {
    return this.request<void>(`/transactions/${id}`, {
      method: 'DELETE',
    });
  }


  async getCategories(): Promise<Category[]> {
    try {
      const categories = await this.request<Category[]>('/categories');
      if (!categories || categories.length === 0) {
        return this.getDefaultCategories();
      }
      return categories;
    } catch (error) {
      console.warn('Failed to fetch categories from backend, using default categories:', error);
      return this.getDefaultCategories();
    }
  }


  private async getDefaultCategories(): Promise<Category[]> {
    try {
      const baseUrl = typeof window === 'undefined' ? '' : '';
      const response = await fetch(`${baseUrl}/data/categories.json`);
      if (!response.ok) {
        throw new Error('Failed to load default categories');
      }
      return response.json();
    } catch (error) {
      console.error('Failed to load default categories:', error);
      return [
        { id: '1', name: 'Food & Dining' },
        { id: '2', name: 'Shopping' },
        { id: '3', name: 'Transportation' },
        { id: '4', name: 'Bills & Utilities' },
        { id: '5', name: 'Entertainment' },
      ];
    }
  }

  async createCategory(data: CreateCategoryDto): Promise<Category> {
    return this.request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }


  async getBudgets(withSpending = false): Promise<Budget[] | BudgetWithSpending[]> {
    const url = `/budgets${withSpending ? '?withSpending=true' : ''}`;
    return this.request<Budget[] | BudgetWithSpending[]>(url);
  }

  async getBudget(id: string, withSpending = false): Promise<Budget | BudgetWithSpending> {
    const url = `/budgets/${id}${withSpending ? '?withSpending=true' : ''}`;
    return this.request<Budget | BudgetWithSpending>(url);
  }

  async createBudget(data: CreateBudgetDto): Promise<Budget> {
    return this.request<Budget>('/budgets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBudget(id: string, data: UpdateBudgetDto): Promise<Budget> {
    return this.request<Budget>(`/budgets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteBudget(id: string): Promise<void> {
    return this.request<void>(`/budgets/${id}`, {
      method: 'DELETE',
    });
  }


  async register(data: { email: string; password: string; name: string }): Promise<{
    user: { id: string; email: string; name: string };
    access_token: string;
  }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }): Promise<{
    user: { id: string; email: string; name: string };
    access_token: string;
  }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

