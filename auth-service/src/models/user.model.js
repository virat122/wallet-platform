const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/db');

/**
 * User model — thin data-access layer over the `users` table.
 * No ORM here on purpose: keeps queries explicit, which matters
 * a lot in a financial-adjacent service where you want to be able
 * to read exactly what SQL runs.
 */

async function createUser({ email, passwordHash, fullName, role = 'customer' }) {
  const id = uuidv4();
  await pool.query(
    `INSERT INTO users (id, email, password_hash, full_name, role, status)
     VALUES (?, ?, ?, ?, ?, 'active')`,
    [id, email, passwordHash, fullName, role]
  );
  return findUserById(id);
}

async function findUserByEmail(email) {
  const [rows] = await pool.query(
    `SELECT id, email, password_hash, full_name, role, status, created_at
     FROM users WHERE email = ? LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

async function findUserById(id) {
  const [rows] = await pool.query(
    `SELECT id, email, full_name, role, status, created_at
     FROM users WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function updateUserStatus(id, status) {
  await pool.query(`UPDATE users SET status = ? WHERE id = ?`, [status, id]);
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserStatus,
};
