import { Injectable, NotFoundException } from '@nestjs/common';
import { Budget, BudgetWithSpending, TimePeriod } from './budget.interface';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { v4 as uuidv4 } from 'uuid';

const budgets: Budget[] = [];

@Injectable()
export class BudgetsService {
  private mockTransactions: Array<{
    category: string;
    amount: number;
    date: string;
    type: 'income' | 'expense';
  }> = [];

  create(createBudgetDto: CreateBudgetDto, userId: string): Budget {
    const now = new Date().toISOString();
    const startDate = createBudgetDto.startDate || now;

    const budget: Budget = {
      id: uuidv4(),
      userId,
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

  findAll(userId?: string): Budget[] {
    if (!userId) {
      return [];
    }
    return budgets.filter((b) => b.userId === userId);
  }

  findOne(id: string, userId?: string): Budget {
    const budget = budgets.find((b) => {
      if (userId) {
        return b.id === id && b.userId === userId;
      }
      return b.id === id;
    });
    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }
    return budget;
  }

  update(id: string, updateBudgetDto: UpdateBudgetDto, userId?: string): Budget {
    const budget = this.findOne(id, userId);

    const updatedBudget: Budget = {
      ...budget,
      ...updateBudgetDto,
      updatedAt: new Date().toISOString(),
    };

    const budgetIndex = budgets.findIndex((b) => b.id === id);
    budgets[budgetIndex] = updatedBudget;
    return updatedBudget;
  }

  remove(id: string, userId?: string): void {
    const budget = this.findOne(id, userId);
    const budgetIndex = budgets.findIndex((b) => b.id === id);
    budgets.splice(budgetIndex, 1);
  }


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


  findAllWithSpending(userId?: string): BudgetWithSpending[] {
    const userBudgets = userId ? budgets.filter((b) => b.userId === userId) : budgets;
    return userBudgets.map((budget) => this.calculateSpending(budget));
  }


  findOneWithSpending(id: string, userId?: string): BudgetWithSpending {
    const budget = this.findOne(id, userId);
    return this.calculateSpending(budget);
  }


  private calculateCurrentSpending(
    category: string,
    startDate: string,
    endDate: string | undefined,
    timePeriod: TimePeriod,
  ): number {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : this.getPeriodEnd(start, timePeriod);


    const relevantTransactions = this.mockTransactions.filter((transaction) => {
      if (transaction.category !== category) return false;
      if (transaction.type !== 'expense') return false;

      const transactionDate = new Date(transaction.date);
      return transactionDate >= start && transactionDate <= end;
    });


    return relevantTransactions.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
  }


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


  setMockTransactions(transactions: Array<{
    category: string;
    amount: number;
    date: string;
    type: 'income' | 'expense';
  }>) {
    this.mockTransactions = transactions;
  }
}



