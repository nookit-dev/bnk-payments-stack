import Database from 'bun:sqlite';

export const db = new Database('data.db');

db.query(
  `
      CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY UNIQUE,
          username TEXT UNIQUE,
          password_hash TEXT,
          salt TEXT UNIQUE
      )
  `,
).run();
