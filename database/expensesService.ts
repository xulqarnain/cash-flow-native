import { getDatabase } from './init';
import type { Expense } from '@/types/database';

export async function createExpense(data: {
  description: string;
  amount: number;
  date: string;
  category?: string;
}): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO expenses (description, amount, date, category) VALUES (?, ?, ?, ?)',
    [data.description, data.amount, data.date, data.category || null]
  );
  return result.lastInsertRowId;
}

export async function getAllExpenses(): Promise<Expense[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Expense>(
    'SELECT * FROM expenses ORDER BY date DESC, id DESC'
  );
}

export async function getExpenseById(id: number): Promise<Expense | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<Expense>(
    'SELECT * FROM expenses WHERE id = ?',
    [id]
  );
  return result || null;
}

export async function updateExpense(
  id: number,
  data: {
    description: string;
    amount: number;
    date: string;
    category?: string;
  }
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE expenses SET description = ?, amount = ?, date = ?, category = ? WHERE id = ?',
    [data.description, data.amount, data.date, data.category || null, id]
  );
}

export async function deleteExpense(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM expenses WHERE id = ?', [id]);
}

export async function searchExpenses(query: string): Promise<Expense[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Expense>(
    `SELECT * FROM expenses
     WHERE description LIKE ? OR category LIKE ?
     ORDER BY date DESC, id DESC`,
    [`%${query}%`, `%${query}%`]
  );
}

export async function getExpensesByDateRange(
  startDate: string,
  endDate: string
): Promise<Expense[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Expense>(
    'SELECT * FROM expenses WHERE date >= ? AND date <= ? ORDER BY date DESC, id DESC',
    [startDate, endDate]
  );
}

export async function getTotalExpenses(): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(amount), 0) as total FROM expenses'
  );
  return result?.total || 0;
}
