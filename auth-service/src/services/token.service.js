const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');
const refreshTokenModel = require('../models/refreshToken.model');

/**
 * All token logic lives here — controllers/services should never call
 * jsonwebtoken directly. Keeps secret usage and expiry rules in one place.
 */

function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessExpiry }
  );
}

function signRefreshToken(user) {
  // Refresh token payload is intentionally minimal — it's just a
  // long-lived "who is this" reference, not an authorization token.
  return jwt.sign({ sub: user.id }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiry,
  });
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.accessSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwt.refreshSecret);
}

function expiryDateFromJwt(decodedExp) {
  // decodedExp is seconds-since-epoch (JWT standard)
  return new Date(decodedExp * 1000);
}

/**
 * Issues an access + refresh token pair for a user, and persists
 * the refresh token (hashed) so it can be revoked / rotated later.
 */
async function issueTokenPair(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  const decoded = jwt.decode(refreshToken);
  const tokenHash = hashToken(refreshToken);

  await refreshTokenModel.storeRefreshToken({
    userId: user.id,
    tokenHash,
    expiresAt: expiryDateFromJwt(decoded.exp),
  });

  return { accessToken, refreshToken };
}

/**
 * Rotates a refresh token: verifies it, checks it's not revoked/expired
 * in the DB, revokes the old one, and issues a brand new pair.
 * Rotation (rather than reusing the same refresh token) limits the
 * damage window if a refresh token is ever stolen.
 */
async function rotateRefreshToken(rawRefreshToken, user) {
  const tokenHash = hashToken(rawRefreshToken);
  const stored = await refreshTokenModel.findValidToken(tokenHash);

  if (!stored) {
    return null; // caller treats this as invalid/expired/reused token
  }

  await refreshTokenModel.revokeToken(tokenHash);
  return issueTokenPair(user);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  issueTokenPair,
  rotateRefreshToken,
};
