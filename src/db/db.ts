import Database from 'bun:sqlite';

export const db = new Database('data.db');

// enable foreign keys
db.exec(`PRAGMA foreign_keys = ON;`);
