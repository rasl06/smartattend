const { pool } = require('../config/db');
const { haversine } = require('../utils/geo');

const LATE_THRESHOLD_MIN = 10;
const GEO_RADIUS = parseFloat(process.env.GEO_RADIUS) || 150;

/** Геолокационная проверка: студент должен быть в радиусе от аудитории */
async function checkGeoFence(classId, lat, lng) {
  if (!lat || !lng) return; // геолокация не передана — пропускаем

  const { rows } = await pool.query(
    'SELECT lat, lng FROM classes WHERE id = $1', [classId]
  );
  if (!rows[0]?.lat) return; // координаты аудитории не заданы

  const dist = haversine(lat, lng, parseFloat(rows[0].lat), parseFloat(rows[0].lng));
  if (dist > GEO_RADIUS) {
    throw Object.assign(
      new Error(`Too far from classroom: ${Math.round(dist)}m (max ${GEO_RADIUS}m)`),
      { status: 403 }
    );
  }
}

/** Привязка к устройству (первый раз — сохранение, потом — проверка) */
async function checkDeviceBinding(studentId, deviceFp) {
  if (!deviceFp) return;
  const { rows } = await pool.query('SELECT device_id FROM users WHERE id=$1', [studentId]);
  const stored = rows[0]?.device_id;

  if (!stored) {
    await pool.query('UPDATE users SET device_id=$1 WHERE id=$2', [deviceFp, studentId]);
    return;
  }
  // Не блокируем, но пишем в аудит при несовпадении
  if (stored !== deviceFp) {
    await pool.query(
      `INSERT INTO audit_log(user_id,action,details) VALUES($1,$2,$3::jsonb)`,
      [studentId, 'device_mismatch', JSON.stringify({ expected: stored, received: deviceFp })]
    );
  }
}

/** Определяет статус: present или late */
async function resolveStatus(classId) {
  const { rows } = await pool.query('SELECT starts_at FROM classes WHERE id=$1', [classId]);
  if (!rows[0]) throw Object.assign(new Error('Class not found'), { status: 404 });
  const diffMin = (Date.now() - new Date(rows[0].starts_at).getTime()) / 60000;
  return diffMin > LATE_THRESHOLD_MIN ? 'late' : 'present';
}

/** Проверяет, уже отмечен ли студент на данном занятии */
async function isAlreadyMarked(classId, studentId) {
  const { rowCount } = await pool.query(
    'SELECT 1 FROM attendance_logs WHERE class_id=$1 AND student_id=$2',
    [classId, studentId]
  );
  return rowCount > 0;
}

/** Создаёт запись посещаемости */
async function createLog({ classId, studentId, status, latitude, longitude, deviceFingerprint, ip }) {
  const { rows } = await pool.query(
    `INSERT INTO attendance_logs (class_id,student_id,status,lat,lng,device_fp,ip)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [classId, studentId, status, latitude || null, longitude || null, deviceFingerprint || null, ip]
  );
  return rows[0];
}

/** Получает журнал посещаемости для занятия */
async function getClassAttendance(classId) {
  const { rows } = await pool.query(
    `SELECT al.*, u.full_name, u.email
     FROM attendance_logs al
     JOIN users u ON u.id = al.student_id
     WHERE al.class_id = $1
     ORDER BY al.scanned_at`,
    [classId]
  );
  return rows;
}

/** Статистика посещаемости студента */
async function getStudentStats(studentId) {
  const { rows } = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE status='present') AS present,
       COUNT(*) FILTER (WHERE status='late')    AS late,
       COUNT(*) FILTER (WHERE status='absent')  AS absent,
       COUNT(*) AS total
     FROM attendance_logs
     WHERE student_id=$1`,
    [studentId]
  );
  return rows[0];
}

/** История посещаемости студента с деталями занятий */
async function getStudentHistory(studentId) {
  const { rows } = await pool.query(
    `SELECT al.status, al.scanned_at,
            c.room, c.starts_at, c.ends_at,
            s.name AS subject_name
     FROM attendance_logs al
     JOIN classes c  ON c.id  = al.class_id
     JOIN subjects s ON s.id  = c.subject_id
     WHERE al.student_id = $1
     ORDER BY al.scanned_at DESC
     LIMIT 50`,
    [studentId]
  );
  return rows;
}

module.exports = {
  checkGeoFence,
  checkDeviceBinding,
  resolveStatus,
  isAlreadyMarked,
  createLog,
  getClassAttendance,
  getStudentStats,
  getStudentHistory,
};
