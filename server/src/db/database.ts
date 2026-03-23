import Database from 'better-sqlite3';
import { readFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function initDatabase(dbPath: string): Database.Database {
  // Ensure the directory exists
  mkdirSync(dirname(dbPath), { recursive: true });

  const db = new Database(dbPath);

  // Enable WAL mode for better concurrent performance
  db.pragma('journal_mode = WAL');

  // Run migrations
  const migrationPath = resolve(__dirname, 'migrations', '001-init.sql');
  const migration = readFileSync(migrationPath, 'utf-8');
  db.exec(migration);

  logger.info(`Database initialized at ${dbPath}`);
  return db;
}
