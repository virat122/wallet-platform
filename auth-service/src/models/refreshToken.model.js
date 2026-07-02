const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/db');

/**
 * Refresh tokens are stored hashed (never raw) so a DB leak doesn't
 * hand out valid tokens directly. We store them so we can revoke on
 * logout / detect reuse (rotation security).
 */

async function storeRefreshToken({ userId, tokenHash, expiresAt }) {
  const id = uuidv4();
  await pool.query(
    `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, revoked)
     VALUES (?, ?, ?, ?, FALSE)`,
    [id, userId, tokenHash, expiresAt]
  );
  return id;
}

async function findValidToken(tokenHash) {
  const [rows] = await pool.query(
    `SELECT * FROM refresh_tokens
     WHERE token_hash = ? AND revoked = FALSE AND expires_at > NOW()
     LIMIT 1`,
    [tokenHash]
  );
  return rows[0] || null;
}

async function revokeToken(tokenHash) {
  await pool.query(
    `UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = ?`,
    [tokenHash]
  );
}

async function revokeAllForUser(userId) {
  await pool.query(
    `UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = ?`,
    [userId]
  );
}

module.exports = {
  storeRefreshToken,
  findValidToken,
  revokeToken,
  revokeAllForUser,
};
