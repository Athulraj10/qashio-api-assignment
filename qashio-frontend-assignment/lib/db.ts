import { join } from 'path';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { v4 as uuidv4 } from 'uuid';

export interface Transaction {
  id: string;
  date: string;
  reference: string;
  counterparty: string;
  amount: number;
  status: string;
  category: string;
  narration: string;
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  page?: number;
  limit?: number;
  sortBy?: keyof Transaction;
  sortOrder?: 'asc' | 'desc';
}

interface DatabaseSchema {
  transactions: Transaction[];
}

const file = join(process.cwd(), 'data', 'db.json');

const adapter = new JSONFile<DatabaseSchema>(file);

const db = new Low<DatabaseSchema>(adapter, { transactions: [] });

const initDb = async () => {
  await db.read();

  if (!db.data) {
    db.data = { transactions: [] };
    await db.write();
  }

  return db;
};

export const transactionService = {
  getAll: async () => {
    const database = await initDb();
    return database.data.transactions;
  },

  getById: async (id: string) => {
    const database = await initDb();
    return database.data.transactions.find(transaction => transaction.id === id);
  },

  query: async (filters: TransactionFilters) => {
    const database = await initDb();
    let result = [...database.data.transactions];

    if (filters.startDate) {
      result = result.filter(t => new Date(t.date) >= new Date(filters.startDate!));
    }

    if (filters.endDate) {
      result = result.filter(t => new Date(t.date) <= new Date(filters.endDate!));
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      result = result.filter(t =>
        t.reference.toLowerCase().includes(term) ||
        t.counterparty.toLowerCase().includes(term)
      );
    }

    if (filters.sortBy) {
      const sortOrder = filters.sortOrder === 'desc' ? -1 : 1;
      result = result.sort((a, b) => {
        const aValue = a[filters.sortBy!];
        const bValue = b[filters.sortBy!];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortOrder * aValue.localeCompare(bValue);
        }

        return sortOrder * (aValue > bValue ? 1 : aValue < bValue ? -1 : 0);
      });
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = result.length;

    return {
      data: result.slice(startIndex, endIndex),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  create: async (transaction: Omit<Transaction, 'id'>) => {
    const database = await initDb();
    const newTransaction = {
      id: uuidv4(),
      ...transaction
    };

    database.data.transactions.push(newTransaction);
    await database.write();

    return newTransaction;
  },
  update: async (id: string, data: Partial<Omit<Transaction, 'id'>>) => {
    const database = await initDb();
    const index = database.data.transactions.findIndex(transaction => transaction.id === id);

    if (index === -1) {
      return null;
    }

    const updatedTransaction = {
      ...database.data.transactions[index],
      ...data
    };

    database.data.transactions[index] = updatedTransaction;
    await database.write();

    return updatedTransaction;
  },

  delete: async (id: string) => {
    const database = await initDb();
    const index = database.data.transactions.findIndex(transaction => transaction.id === id);

    if (index === -1) {
      return false;
    }

    database.data.transactions.splice(index, 1);
    await database.write();

    return true;
  }
}; 