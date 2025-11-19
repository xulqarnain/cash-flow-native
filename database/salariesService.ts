import { getDatabase } from './init';
import type { Salary, SalaryStatus } from '@/types/database';

export async function createSalary(data: {
  description: string;
  amount: number;
  date: string;
  status: SalaryStatus;
}): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO salaries (description, amount, date, status) VALUES (?, ?, ?, ?)',
    [data.description, data.amount, data.date, data.status]
  );
  return result.lastInsertRowId;
}

export async function getAllSalaries(): Promise<Salary[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Salary>(
    'SELECT * FROM salaries ORDER BY date DESC, id DESC'
  );
}

export async function getSalaryById(id: number): Promise<Salary | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<Salary>(
    'SELECT * FROM salaries WHERE id = ?',
    [id]
  );
  return result || null;
}

export async function updateSalary(
  id: number,
  data: {
    description: string;
    amount: number;
    date: string;
    status: SalaryStatus;
  }
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE salaries SET description = ?, amount = ?, date = ?, status = ? WHERE id = ?',
    [data.description, data.amount, data.date, data.status, id]
  );
}

export async function deleteSalary(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM salaries WHERE id = ?', [id]);
}

export async function searchSalaries(query: string): Promise<Salary[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Salary>(
    `SELECT * FROM salaries
     WHERE description LIKE ?
     ORDER BY date DESC, id DESC`,
    [`%${query}%`]
  );
}

export async function getSalariesByStatus(status: SalaryStatus): Promise<Salary[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Salary>(
    'SELECT * FROM salaries WHERE status = ? ORDER BY date DESC, id DESC',
    [status]
  );
}

export async function getSalariesByDateRange(
  startDate: string,
  endDate: string
): Promise<Salary[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Salary>(
    'SELECT * FROM salaries WHERE date >= ? AND date <= ? ORDER BY date DESC, id DESC',
    [startDate, endDate]
  );
}

export async function getTotalSalaries(): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(amount), 0) as total FROM salaries'
  );
  return result?.total || 0;
}

export async function getTotalByStatus(status: SalaryStatus): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(amount), 0) as total FROM salaries WHERE status = ?',
    [status]
  );
  return result?.total || 0;
}
