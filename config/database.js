// config/db.js
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

let db;

(async () => {
  db = await open({
    filename: path.join(__dirname, '../data/database.sqlite'),
    driver: sqlite3.Database,
  });

  console.log('✅ Database connected at data/database.sqlite');
})();

module.exports = {
  all: async (sql, params = []) => {
    if (!db) throw new Error('Database not initialized');
    return db.all(sql, params);
  },
  get: async (sql, params = []) => {
    if (!db) throw new Error('Database not initialized');
    return db.get(sql, params);
  },
  run: async (sql, params = []) => {
    if (!db) throw new Error('Database not initialized');
    return db.run(sql, params);
  },
};
