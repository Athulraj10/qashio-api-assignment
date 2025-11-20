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

