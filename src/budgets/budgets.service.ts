import { Injectable, NotFoundException } from '@nestjs/common';
import { Budget, BudgetWithSpending, TimePeriod } from './budget.interface';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage - replace with database in production
const budgets: Budget[] = [];

@Injectable()
export class BudgetsService {
  // Mock transactions for spending calculation
  // In production, this would come from TransactionsService
  private mockTransactions: Array<{
    category: string;
    amount: number;
    date: string;
    type: 'income' | 'expense';
  }> = [];

  create(createBudgetDto: CreateBudgetDto): Budget {
    const now = new Date().toISOString();
    const startDate = createBudgetDto.startDate || now;

    const budget: Budget = {
      id: uuidv4(),
      category: createBudgetDto.category,
      amount: createBudgetDto.amount,
      timePeriod: createBudgetDto.timePeriod,
      startDate,
      endDate: createBudgetDto.endDate,
      createdAt: now,
      updatedAt: now,
    };

    budgets.push(budget);
    return budget;
  }

  findAll(): Budget[] {
    return budgets;
  }

  findOne(id: string): Budget {
    const budget = budgets.find((b) => b.id === id);
    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }
    return budget;
  }

  update(id: string, updateBudgetDto: UpdateBudgetDto): Budget {
    const budgetIndex = budgets.findIndex((b) => b.id === id);
    if (budgetIndex === -1) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }

    const updatedBudget: Budget = {
      ...budgets[budgetIndex],
      ...updateBudgetDto,
      updatedAt: new Date().toISOString(),
    };

    budgets[budgetIndex] = updatedBudget;
    return updatedBudget;
  }

  remove(id: string): void {
    const budgetIndex = budgets.findIndex((b) => b.id === id);
    if (budgetIndex === -1) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }
    budgets.splice(budgetIndex, 1);
  }

  // Calculate spending for a budget
  calculateSpending(budget: Budget): BudgetWithSpending {
    const currentSpending = this.calculateCurrentSpending(
      budget.category,
      budget.startDate,
      budget.endDate,
      budget.timePeriod,
    );

    const remaining = budget.amount - currentSpending;
    const percentageUsed = budget.amount > 0 
      ? (currentSpending / budget.amount) * 100 
      : 0;

    return {
      ...budget,
      currentSpending,
      remaining,
      percentageUsed: Math.round(percentageUsed * 100) / 100,
    };
  }

  // Get all budgets with spending calculations
  findAllWithSpending(): BudgetWithSpending[] {
    return budgets.map((budget) => this.calculateSpending(budget));
  }

  // Get a single budget with spending calculation
  findOneWithSpending(id: string): BudgetWithSpending {
    const budget = this.findOne(id);
    return this.calculateSpending(budget);
  }

  // Calculate current spending for a category within the budget period
  private calculateCurrentSpending(
    category: string,
    startDate: string,
    endDate: string | undefined,
    timePeriod: TimePeriod,
  ): number {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : this.getPeriodEnd(start, timePeriod);

    // Filter transactions by category and date range
    const relevantTransactions = this.mockTransactions.filter((transaction) => {
      if (transaction.category !== category) return false;
      if (transaction.type !== 'expense') return false; // Only count expenses
      
      const transactionDate = new Date(transaction.date);
      return transactionDate >= start && transactionDate <= end;
    });

    // Sum up expenses
    return relevantTransactions.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
  }

  // Get the end date of a time period
  private getPeriodEnd(startDate: Date, timePeriod: TimePeriod): Date {
    const end = new Date(startDate);
    
    switch (timePeriod) {
      case TimePeriod.DAILY:
        end.setDate(end.getDate() + 1);
        break;
      case TimePeriod.WEEKLY:
        end.setDate(end.getDate() + 7);
        break;
      case TimePeriod.MONTHLY:
        end.setMonth(end.getMonth() + 1);
        break;
      case TimePeriod.YEARLY:
        end.setFullYear(end.getFullYear() + 1);
        break;
    }
    
    return end;
  }

  // Method to set mock transactions (for testing/demo purposes)
  // In production, this would be replaced with actual TransactionsService integration
  setMockTransactions(transactions: Array<{
    category: string;
    amount: number;
    date: string;
    type: 'income' | 'expense';
  }>) {
    this.mockTransactions = transactions;
  }
}



