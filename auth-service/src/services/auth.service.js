const bcrypt = require('bcrypt');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const userModel = require('../models/user.model');
const refreshTokenModel = require('../models/refreshToken.model');
const tokenService = require('./token.service');

async function register({ email, password, fullName }) {
  const existing = await userModel.findUserByEmail(email);
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, env.bcrypt.saltRounds);
  const user = await userModel.createUser({ email, passwordHash, fullName });

  const tokens = await tokenService.issueTokenPair(user);
  return { user, tokens };
}

async function login({ email, password }) {
  const user = await userModel.findUserByEmail(email);
  if (!user) {
    // Same error for "no user" and "wrong password" — avoids leaking
    // which emails are registered.
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (user.status !== 'active') {
    throw ApiError.forbidden('This account is not active');
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const safeUser = { id: user.id, email: user.email, role: user.role };
  const tokens = await tokenService.issueTokenPair(safeUser);

  return { user: safeUser, tokens };
}

async function refresh(rawRefreshToken) {
  let decoded;
  try {
    decoded = tokenService.verifyRefreshToken(rawRefreshToken);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const user = await userModel.findUserById(decoded.sub);
  if (!user || user.status !== 'active') {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  const tokens = await tokenService.rotateRefreshToken(rawRefreshToken, user);
  if (!tokens) {
    // Token was valid JWT-wise but revoked/not found in DB —
    // possible reuse of an already-rotated token. Treat as compromised.
    await refreshTokenModel.revokeAllForUser(user.id);
    throw ApiError.unauthorized('Refresh token has been revoked');
  }

  return { user, tokens };
}

async function logout(rawRefreshToken) {
  const tokenHash = tokenService.hashToken(rawRefreshToken);
  await refreshTokenModel.revokeToken(tokenHash);
}

module.exports = { register, login, refresh, logout };
