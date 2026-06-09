const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { pool }  = require('../config/db');
const { redis } = require('../config/redis');

const ACCESS_EXPIRES  = process.env.JWT_ACCESS_EXPIRES  || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '7d';

/** Генерирует пару JWT-токенов */
function generateTokens(user) {
  const payload = { id: user.id, email: user.email, role: user.role, jti: uuidv4() };

  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES,
  });
  const refreshToken = jwt.sign(
    { id: user.id, jti: uuidv4() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES }
  );
  return { accessToken, refreshToken };
}

/** Аутентификация пользователя по email/password */
async function login(email, password) {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE email = $1 AND is_active = true', [email]
  );
  if (!rows.length) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

  const tokens = generateTokens(user);

  // Сохраняем refresh-токен в Redis (7 дней)
  await redis.set(`rt:${user.id}`, tokens.refreshToken, { EX: 7 * 24 * 3600 });

  return {
    user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
    ...tokens,
  };
}

/** Обновление access-токена по refresh-токену */
async function refresh(refreshToken) {
  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw Object.assign(new Error('Invalid refresh token'), { status: 401 });
  }

  const stored = await redis.get(`rt:${payload.id}`);
  if (stored !== refreshToken) {
    throw Object.assign(new Error('Refresh token reused or expired'), { status: 401 });
  }

  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [payload.id]);
  if (!rows.length) throw Object.assign(new Error('User not found'), { status: 401 });

  const tokens = generateTokens(rows[0]);
  await redis.set(`rt:${payload.id}`, tokens.refreshToken, { EX: 7 * 24 * 3600 });
  return tokens;
}

/** Выход — инвалидация токенов */
async function logout(userId, accessJti) {
  await redis.del(`rt:${userId}`);
  // Кладём access JTI в черный список на 15 минут
  await redis.set(`bl:${accessJti}`, '1', { EX: 900 });
}

/** Получить профиль пользователя */
async function getProfile(userId) {
  const { rows } = await pool.query(
    'SELECT id, email, role, full_name, created_at FROM users WHERE id = $1',
    [userId]
  );
  return rows[0] || null;
}

module.exports = { login, refresh, logout, getProfile };
