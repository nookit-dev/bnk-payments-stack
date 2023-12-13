import Database from "bun:sqlite";

export const db = new Database("data.sqlite");

// enable foreign keys
db.exec("PRAGMA foreign_keys = ON;");
