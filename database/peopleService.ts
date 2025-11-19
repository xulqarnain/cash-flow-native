import { getDatabase } from './init';
import type { Person, PersonWithBalance } from '@/types/database';

export async function createPerson(name: string, email?: string): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO people (name, email) VALUES (?, ?)',
    name,
    email || null
  );
  return result.lastInsertRowId;
}

export async function getAllPeople(): Promise<Person[]> {
  const db = await getDatabase();
  const result = await db.getAllAsync<Person>(
    'SELECT * FROM people ORDER BY name ASC'
  );
  return result;
}

export async function getPeopleWithBalances(): Promise<PersonWithBalance[]> {
  const db = await getDatabase();
  const result = await db.getAllAsync<PersonWithBalance>(`
    SELECT
      p.*,
      COALESCE(
        SUM(CASE WHEN t.type = 'incoming' THEN t.amount ELSE -t.amount END),
        0
      ) as balance,
      COUNT(t.id) as transactionCount
    FROM people p
    LEFT JOIN transactions t ON p.id = t.personId
    GROUP BY p.id
    ORDER BY p.name ASC
  `);
  return result;
}

export async function getPersonById(id: number): Promise<Person | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<Person>(
    'SELECT * FROM people WHERE id = ?',
    id
  );
  return result || null;
}

export async function getPersonWithBalance(id: number): Promise<PersonWithBalance | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<PersonWithBalance>(`
    SELECT
      p.*,
      COALESCE(
        SUM(CASE WHEN t.type = 'incoming' THEN t.amount ELSE -t.amount END),
        0
      ) as balance,
      COUNT(t.id) as transactionCount
    FROM people p
    LEFT JOIN transactions t ON p.id = t.personId
    WHERE p.id = ?
    GROUP BY p.id
  `, id);
  return result || null;
}

export async function updatePerson(id: number, name: string, email?: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE people SET name = ?, email = ? WHERE id = ?',
    name,
    email || null,
    id
  );
}

export async function deletePerson(id: number): Promise<void> {
  const db = await getDatabase();
  // Transactions will be deleted automatically due to ON DELETE CASCADE
  await db.runAsync('DELETE FROM people WHERE id = ?', id);
}

export async function searchPeople(query: string): Promise<Person[]> {
  const db = await getDatabase();
  const searchPattern = `%${query}%`;
  const result = await db.getAllAsync<Person>(
    'SELECT * FROM people WHERE name LIKE ? OR email LIKE ? ORDER BY name ASC',
    searchPattern,
    searchPattern
  );
  return result;
}
