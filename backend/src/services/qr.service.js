const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const { redis } = require('../config/redis');

const SECRET_KEY = process.env.QR_SECRET_KEY || 'fallback_dev_secret';
const TOKEN_TTL  = parseInt(process.env.QR_TOKEN_TTL) || 90;

/** base64url-кодирование объекта */
function b64url(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

/**
 * Генерирует HMAC-SHA256 подписанный одноразовый QR-токен для занятия
 * Структура: header.payload.signature (аналогично JWT, но легче)
 */
async function generateQRToken(classId) {
  const now = Math.floor(Date.now() / 1000);
  const jti = uuidv4();

  const header  = b64url({ alg: 'HS256', typ: 'QRT' });
  const payload = b64url({ class_id: classId, iat: now, exp: now + TOKEN_TTL, jti });

  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(`${header}.${payload}`)
    .digest('base64url');

  const token = `${header}.${payload}.${signature}`;

  // Сохраняем jti в Redis с TTL — для однократного использования
  await redis.set(`qr:${jti}`, classId, { EX: TOKEN_TTL });

  // Генерируем QR-изображение в base64 PNG
  const qrImage = await QRCode.toDataURL(token, {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    width: 300,
    margin: 2,
  });

  return { qrImage, token, expiresAt: now + TOKEN_TTL, ttl: TOKEN_TTL };
}

/**
 * Верифицирует QR-токен (4 этапа проверки)
 * @returns {object} payload если токен валиден
 */
async function verifyQRToken(rawToken, classId) {
  const parts = rawToken.split('.');
  if (parts.length !== 3) throw Object.assign(new Error('Malformed token'), { status: 400 });

  const [header, payloadB64, sigRecv] = parts;

  // 1. Проверка HMAC-подписи
  const sigCalc = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(`${header}.${payloadB64}`)
    .digest('base64url');

  if (sigCalc !== sigRecv) {
    throw Object.assign(new Error('Invalid token signature'), { status: 401 });
  }

  // 2. Декодируем payload
  let payload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
  } catch {
    throw Object.assign(new Error('Cannot parse token payload'), { status: 400 });
  }

  // 3. Проверка времени жизни (+5 сек допуск на NTP-рассинхрон)
  const now = Math.floor(Date.now() / 1000);
  if (now > payload.exp + 5) {
    throw Object.assign(new Error('Token expired'), { status: 401 });
  }

  // 4. Проверка привязки к занятию
  if (payload.class_id !== classId) {
    throw Object.assign(new Error('Token class mismatch'), { status: 401 });
  }

  // 5. Однократное использование — GETDEL атомарно проверяет и удаляет
  const exists = await redis.getDel(`qr:${payload.jti}`);
  if (!exists) {
    throw Object.assign(new Error('Token already used or expired'), { status: 401 });
  }

  return payload;
}

module.exports = { generateQRToken, verifyQRToken };
