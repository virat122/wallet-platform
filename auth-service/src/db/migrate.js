/**
 * Minimal migration runner — reads .sql files from /migrations in order
 * and executes them. For anything beyond a portfolio project, swap this
 * for a real tool (Knex, db-migrate, Flyway, etc).
 */
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');
const logger = require('../utils/logger');

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    logger.info(`Running migration: ${file}`);

    // mysql2 can run multiple statements only with multipleStatements: true
    const conn = await pool.getConnection();
    try {
      await conn.query(sql);
      logger.info(`Migration applied: ${file}`);
    } finally {
      conn.release();
    }
  }

  process.exit(0);
}

runMigrations().catch((err) => {
  logger.error('Migration failed', { error: err.message });
  process.exit(1);
});
