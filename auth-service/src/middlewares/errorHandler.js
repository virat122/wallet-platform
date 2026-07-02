const logger = require('../utils/logger');

/**
 * Last middleware in the chain. Every controller calls next(err) on
 * failure instead of handling the response itself — this is the only
 * place that decides status codes and response shape for errors.
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  if (!isOperational) {
    // Unexpected error (bug, DB connection drop, etc) — log full detail
    logger.error('Unhandled error', {
      message: err.message,
      stack: err.stack,
      path: req.path,
    });
  } else {
    logger.warn('Operational error', {
      message: err.message,
      statusCode,
      path: req.path,
    });
  }

  res.status(statusCode).json({
    error: {
      message: isOperational ? err.message : 'Something went wrong',
      ...(err.details ? { details: err.details } : {}),
    },
  });
}

module.exports = errorHandler;
