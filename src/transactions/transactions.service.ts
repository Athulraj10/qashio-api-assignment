import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const transaction = this.transactionRepository.create({
      amount: createTransactionDto.amount,
      category: createTransactionDto.category,
      type: createTransactionDto.type,
      date: new Date(createTransactionDto.date),
      description: createTransactionDto.description || null,
    });
    return await this.transactionRepository.save(transaction);
  }

  async findAll(filters?: {
    type?: 'income' | 'expense';
    category?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<Transaction[]> {
    const queryBuilder = this.transactionRepository.createQueryBuilder('transaction');

    if (filters?.type) {
      queryBuilder.andWhere('transaction.type = :type', { type: filters.type });
    }

    if (filters?.category) {
      queryBuilder.andWhere('transaction.category = :category', { category: filters.category });
    }

    if (filters?.startDate) {
      queryBuilder.andWhere('transaction.date >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      queryBuilder.andWhere('transaction.date <= :endDate', { endDate: filters.endDate });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(transaction.category ILIKE :search OR transaction.description ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    return await queryBuilder
      .orderBy('transaction.date', 'DESC')
      .addOrderBy('transaction.createdAt', 'DESC')
      .getMany();
  }

  async getSummary(filters?: {
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
    const queryBuilder = this.transactionRepository.createQueryBuilder('transaction');

    if (filters?.startDate) {
      queryBuilder.andWhere('transaction.date >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      queryBuilder.andWhere('transaction.date <= :endDate', { endDate: filters.endDate });
    }

    if (filters?.type) {
      queryBuilder.andWhere('transaction.type = :type', { type: filters.type });
    }

    const transactions = await queryBuilder.getMany();

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = totalIncome - totalExpenses;

    // Group by category
    const categoryMap = new Map<string, { total: number; count: number }>();
    transactions.forEach(t => {
      const existing = categoryMap.get(t.category) || { total: 0, count: 0 };
      categoryMap.set(t.category, {
        total: existing.total + Number(t.amount),
        count: existing.count + 1,
      });
    });

    const byCategory = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
    })).sort((a, b) => b.total - a.total);

    // Group by month
    const monthMap = new Map<string, { income: number; expenses: number }>();
    transactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const existing = monthMap.get(monthKey) || { income: 0, expenses: 0 };
      if (t.type === 'income') {
        existing.income += Number(t.amount);
      } else {
        existing.expenses += Number(t.amount);
      }
      monthMap.set(monthKey, existing);
    });

    const byMonth = Array.from(monthMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      totalIncome,
      totalExpenses,
      balance,
      transactionCount: transactions.length,
      byCategory,
      byMonth,
    };
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
    });
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    return transaction;
  }

  async update(
    id: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const transaction = await this.findOne(id);
    
    if (updateTransactionDto.amount !== undefined) {
      transaction.amount = updateTransactionDto.amount;
    }
    if (updateTransactionDto.category) {
      transaction.category = updateTransactionDto.category;
    }
    if (updateTransactionDto.type) {
      transaction.type = updateTransactionDto.type;
    }
    if (updateTransactionDto.date) {
      transaction.date = new Date(updateTransactionDto.date);
    }
    if (updateTransactionDto.description !== undefined) {
      transaction.description = updateTransactionDto.description || null;
    }
    
    return await this.transactionRepository.save(transaction);
  }

  async remove(id: string): Promise<void> {
    const transaction = await this.findOne(id);
    await this.transactionRepository.remove(transaction);
  }
}

