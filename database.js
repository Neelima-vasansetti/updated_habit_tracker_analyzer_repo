const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const DB_PATH = path.join(__dirname, "habits.db");

const db = new sqlite3.Database(DB_PATH, err => {
  if (err) console.error("DB error:", err);
  else console.log("📦 SQLite connected at", DB_PATH);
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      name TEXT NOT NULL,
      schedule TEXT CHECK(schedule IN ('daily','weekly')),
      days TEXT,
      goalType TEXT,
      goalValue INTEGER,
      timing TEXT NOT NULL,
      createdAt TEXT DEFAULT (date('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS logs (
      habitId INTEGER,
      date TEXT,
      status TEXT CHECK(status IN ('done','missed')),
      PRIMARY KEY (habitId, date)
    )
  `);
});

module.exports = db;
