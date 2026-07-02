const authService = require('../services/auth.service');
const ApiError = require('../utils/ApiError');


async function register(req, res, next) {
  try {
   

    const { user, tokens } = await authService.register(req.body);

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user.id, email: user.email, fullName: user.full_name },
      ...tokens,
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
   
    const { user, tokens } = await authService.login(req.body);

    res.status(200).json({
      message: 'Login successful',
      user,
      ...tokens,
    });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {

    const { tokens } = await authService.refresh(req.body.refreshToken);

    res.status(200).json({ message: 'Token refreshed', ...tokens });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {

    await authService.logout(req.body.refreshToken);

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

/**
 * Used by other services (via API gateway) or the frontend to check
 * the current user's identity from an access token. Relies on the
 * `authenticate` middleware having already verified the token.
 */
async function me(req, res) {
  res.status(200).json({ user: req.user });
}

module.exports = { register, login, refresh, logout, me };
