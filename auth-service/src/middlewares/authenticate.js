const tokenService = require('../services/token.service');
const ApiError = require('../utils/ApiError');

/**
 * Verifies the Bearer access token on protected routes and attaches
 * the decoded identity to req.user. Other services behind the
 * api-gateway can rely on this same shape if they verify the JWT
 * themselves using the shared JWT_ACCESS_SECRET.
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Missing or malformed Authorization header'));
  }

  const token = header.split(' ')[1];

  try {
    const decoded = tokenService.verifyAccessToken(token);
    req.user = { id: decoded.sub, email: decoded.email, role: decoded.role };
    next();
  } catch (err) {
    next(ApiError.unauthorized('Invalid or expired access token'));
  }
}

/**
 * Role-based gate. Usage: router.get('/admin', authenticate, requireRole('admin'), handler)
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
