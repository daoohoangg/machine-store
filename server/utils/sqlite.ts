import Database from 'better-sqlite3'
import * as path from 'node:path'
import * as fs from 'node:fs'

let _db: Database.Database | null = null

export const useSqlite = () => {
  if (_db) return _db

  const dbPath = path.resolve(process.cwd(), 'database.sqlite')
  
  // Ensure the directory exists (though it's in root here)
  const dir = path.dirname(dbPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  _db = new Database(dbPath)
  
  // Initialize tables
  _db.exec(`
    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE,
      image TEXT,
      tag TEXT,
      title TEXT,
      description TEXT,
      link TEXT,
      content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS manual_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_key TEXT,
      product_id TEXT,
      product_data TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(group_key, product_id)
    );
  `)

  return _db
}
