const logger = require('../utils/logger');

/**
 * Централизованный обработчик ошибок Express
 */
function errorHandler(err, req, res, next) {
  logger.error(err.message, { stack: err.stack, url: req.originalUrl });

  const status = err.status || err.statusCode || 500;
  const message = status < 500 ? err.message : 'Internal server error';

  res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

/**
 * 404 handler
 */
function notFound(req, res) {
  res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found` });
}

module.exports = { errorHandler, notFound };
