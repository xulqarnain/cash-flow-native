import { getDatabase } from './init';
import type { Transaction, TransactionWithPerson, TransactionType, DashboardStats } from '@/types/database';

export interface CreateTransactionData {
  personId: number;
  amount: number;
  type: TransactionType;
  description: string;
  category?: string;
  date: string;
}

export async function createTransaction(data: CreateTransactionData): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO transactions (personId, amount, type, description, category, date) VALUES (?, ?, ?, ?, ?, ?)',
    data.personId,
    data.amount,
    data.type,
    data.description,
    data.category || null,
    data.date
  );
  return result.lastInsertRowId;
}

export async function getAllTransactions(): Promise<TransactionWithPerson[]> {
  const db = await getDatabase();
  const result = await db.getAllAsync<TransactionWithPerson>(`
    SELECT
      t.*,
      p.name as personName
    FROM transactions t
    INNER JOIN people p ON t.personId = p.id
    ORDER BY t.date DESC, t.createdAt DESC
  `);
  return result;
}

export async function getTransactionsByPerson(personId: number): Promise<Transaction[]> {
  const db = await getDatabase();
  const result = await db.getAllAsync<Transaction>(
    'SELECT * FROM transactions WHERE personId = ? ORDER BY date DESC, createdAt DESC',
    personId
  );
  return result;
}

export async function getTransactionById(id: number): Promise<Transaction | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<Transaction>(
    'SELECT * FROM transactions WHERE id = ?',
    id
  );
  return result || null;
}

export async function updateTransaction(id: number, data: Partial<CreateTransactionData>): Promise<void> {
  const db = await getDatabase();
  const updates: string[] = [];
  const values: any[] = [];

  if (data.personId !== undefined) {
    updates.push('personId = ?');
    values.push(data.personId);
  }
  if (data.amount !== undefined) {
    updates.push('amount = ?');
    values.push(data.amount);
  }
  if (data.type !== undefined) {
    updates.push('type = ?');
    values.push(data.type);
  }
  if (data.description !== undefined) {
    updates.push('description = ?');
    values.push(data.description);
  }
  if (data.category !== undefined) {
    updates.push('category = ?');
    values.push(data.category || null);
  }
  if (data.date !== undefined) {
    updates.push('date = ?');
    values.push(data.date);
  }

  if (updates.length > 0) {
    values.push(id);
    await db.runAsync(
      `UPDATE transactions SET ${updates.join(', ')} WHERE id = ?`,
      ...values
    );
  }
}

export async function deleteTransaction(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM transactions WHERE id = ?', id);
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const db = await getDatabase();

  const statsResult = await db.getFirstAsync<{
    totalIncoming: number;
    totalOutgoing: number;
    transactionCount: number;
  }>(`
    SELECT
      COALESCE(SUM(CASE WHEN type = 'incoming' THEN amount ELSE 0 END), 0) as totalIncoming,
      COALESCE(SUM(CASE WHEN type = 'outgoing' THEN amount ELSE 0 END), 0) as totalOutgoing,
      COUNT(*) as transactionCount
    FROM transactions
  `);

  const peopleResult = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM people'
  );

  const stats = statsResult || { totalIncoming: 0, totalOutgoing: 0, transactionCount: 0 };
  const peopleCount = peopleResult?.count || 0;

  return {
    totalBalance: stats.totalIncoming - stats.totalOutgoing,
    totalIncoming: stats.totalIncoming,
    totalOutgoing: stats.totalOutgoing,
    transactionCount: stats.transactionCount,
    peopleCount,
  };
}

export async function getTransactionsByDateRange(startDate: string, endDate: string): Promise<TransactionWithPerson[]> {
  const db = await getDatabase();
  const result = await db.getAllAsync<TransactionWithPerson>(`
    SELECT
      t.*,
      p.name as personName
    FROM transactions t
    INNER JOIN people p ON t.personId = p.id
    WHERE t.date BETWEEN ? AND ?
    ORDER BY t.date DESC, t.createdAt DESC
  `, startDate, endDate);
  return result;
}

export async function getTransactionsByType(type: TransactionType): Promise<TransactionWithPerson[]> {
  const db = await getDatabase();
  const result = await db.getAllAsync<TransactionWithPerson>(`
    SELECT
      t.*,
      p.name as personName
    FROM transactions t
    INNER JOIN people p ON t.personId = p.id
    WHERE t.type = ?
    ORDER BY t.date DESC, t.createdAt DESC
  `, type);
  return result;
}

export async function searchTransactions(query: string): Promise<TransactionWithPerson[]> {
  const db = await getDatabase();
  const searchPattern = `%${query}%`;
  const result = await db.getAllAsync<TransactionWithPerson>(`
    SELECT
      t.*,
      p.name as personName
    FROM transactions t
    INNER JOIN people p ON t.personId = p.id
    WHERE t.description LIKE ? OR t.category LIKE ? OR p.name LIKE ?
    ORDER BY t.date DESC, t.createdAt DESC
  `, searchPattern, searchPattern, searchPattern);
  return result;
}

export interface ChartDataPoint {
  date: string;
  incoming: number;
  outgoing: number;
  balance: number;
}

export async function getChartData(days: number = 7): Promise<ChartDataPoint[]> {
  const db = await getDatabase();

  // Get data for the last N days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (days - 1));

  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  const result = await db.getAllAsync<{
    date: string;
    incoming: number;
    outgoing: number;
  }>(`
    SELECT
      date,
      COALESCE(SUM(CASE WHEN type = 'incoming' THEN amount ELSE 0 END), 0) as incoming,
      COALESCE(SUM(CASE WHEN type = 'outgoing' THEN amount ELSE 0 END), 0) as outgoing
    FROM transactions
    WHERE date BETWEEN ? AND ?
    GROUP BY date
    ORDER BY date ASC
  `, startDateStr, endDateStr);

  // Create a map of existing data
  const dataMap = new Map<string, { incoming: number; outgoing: number }>();
  result.forEach(row => {
    dataMap.set(row.date, { incoming: row.incoming, outgoing: row.outgoing });
  });

  // Fill in missing dates with zeros
  const chartData: ChartDataPoint[] = [];
  let runningBalance = 0;

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    const data = dataMap.get(dateStr) || { incoming: 0, outgoing: 0 };
    runningBalance += data.incoming - data.outgoing;

    chartData.push({
      date: dateStr,
      incoming: data.incoming,
      outgoing: data.outgoing,
      balance: runningBalance,
    });
  }

  return chartData;
}
