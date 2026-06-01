import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, 'users.db'));

db.pragma('journal_mode = WAL');

// Create users table with username column
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    username    TEXT    NOT NULL UNIQUE,
    email       TEXT    NOT NULL UNIQUE,
    password    TEXT    NOT NULL,
    role        TEXT    NOT NULL DEFAULT 'student',
    college     TEXT    DEFAULT 'BIAS',
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    last_login  TEXT
  );
`);

// Add username column to existing DBs that don't have it yet (safe migration)
try {
  db.exec(`ALTER TABLE users ADD COLUMN username TEXT;`);
} catch (_) { /* column already exists — ignore */ }

export default db;
