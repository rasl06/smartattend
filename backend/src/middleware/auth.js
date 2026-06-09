const jwt = require('jsonwebtoken');
const { redis } = require('../config/redis');

/**
 * Проверяет JWT Bearer токен и добавляет req.user
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.slice(7);
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Проверяем, не отозван ли токен (logout)
    const isBlacklisted = await redis.get(`bl:${payload.jti}`);
    if (isBlacklisted) {
      return res.status(401).json({ success: false, error: 'Token revoked' });
    }

    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

/**
 * Ограничивает доступ по роли
 * @param {...string} roles — допустимые роли
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
