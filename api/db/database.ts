import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'lensmeet.db');
const DB_DIR = path.dirname(DB_PATH);

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;

export async function initDatabase(): Promise<Database> {
  if (db) return db;

  if (!SQL) {
    SQL = await initSqlJs({
      locateFile: (file) => path.join(__dirname, '..', '..', 'node_modules', 'sql.js', 'dist', file)
    });
  }

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
    saveDatabase();
  }

  return db;
}

export function saveDatabase(): void {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_PATH, buffer);
}

export function getDb(): Database {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

export function runQuery(sql: string, params: any[] = []): any[] {
  const database = getDb();
  const stmt = database.prepare(sql);
  stmt.bind(params);
  const results: any[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

export function runExecute(sql: string, params: any[] = []): { changes: number; lastInsertRowid: number } {
  const database = getDb();
  const stmt = database.prepare(sql);
  stmt.bind(params);
  stmt.step();
  stmt.free();
  saveDatabase();
  return {
    changes: database.getRowsModified(),
    lastInsertRowid: Number(database.exec('SELECT last_insert_rowid() as id')[0].values[0][0])
  };
}

export function runTransaction(callback: () => void): void {
  const database = getDb();
  database.exec('BEGIN TRANSACTION');
  try {
    callback();
    database.exec('COMMIT');
    saveDatabase();
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
}
