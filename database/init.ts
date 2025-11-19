import * as SQLite from 'expo-sqlite';

const DB_NAME = 'cashflow.db';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  db = await SQLite.openDatabaseAsync(DB_NAME);

  // Enable WAL mode
  await db.execAsync('PRAGMA journal_mode = WAL;');

  // Check if we need to migrate from email to phone
  await migrateEmailToPhone(db);

  // Create tables if they don't exist
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS people (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      personId INTEGER NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('incoming', 'outgoing')),
      description TEXT NOT NULL,
      category TEXT,
      date TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (personId) REFERENCES people (id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_personId ON transactions(personId);
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
  `);

  return db;
}

async function migrateEmailToPhone(database: SQLite.SQLiteDatabase): Promise<void> {
  try {
    // Check if people table exists with email column
    const result = await database.getAllAsync<{ name: string }>(
      "SELECT name FROM pragma_table_info('people') WHERE name='email'"
    );

    if (result.length > 0) {
      // Email column exists, need to migrate
      console.log('Migrating people table from email to phone...');

      // Disable foreign key constraints temporarily
      await database.execAsync('PRAGMA foreign_keys = OFF;');

      // Create new table with phone column
      await database.execAsync(`
        CREATE TABLE people_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          phone TEXT,
          createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Copy data from old table to new table (email -> phone)
      await database.execAsync(`
        INSERT INTO people_new (id, name, phone, createdAt)
        SELECT id, name, email, createdAt FROM people;
      `);

      // Drop old table
      await database.execAsync('DROP TABLE people;');

      // Rename new table to people
      await database.execAsync('ALTER TABLE people_new RENAME TO people;');

      // Re-enable foreign key constraints
      await database.execAsync('PRAGMA foreign_keys = ON;');

      console.log('Migration completed successfully');
    }
  } catch (error) {
    console.log('No migration needed or table does not exist yet:', error);
  }
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    return await initDatabase();
  }
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}

export async function resetDatabase(): Promise<void> {
  const database = await getDatabase();
  await database.execAsync(`
    DROP TABLE IF EXISTS transactions;
    DROP TABLE IF EXISTS people;
  `);
  await closeDatabase();
  await initDatabase();
}
