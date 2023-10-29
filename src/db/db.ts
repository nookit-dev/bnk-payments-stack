import Database from 'bun:sqlite';

export const db = new Database('data.db');

db.query(
  `
      CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY UNIQUE,
          username TEXT UNIQUE,
          passwordHash TEXT,
          salt TEXT UNIQUE
      )
  `,
).run();
