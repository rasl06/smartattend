const { pool } = require('../config/db');
const bcrypt   = require('bcryptjs');

async function getUsers(req, res, next) {
  try {
    const role = req.query.role || null;
    let q = 'SELECT id,email,role,full_name,is_active,created_at FROM users';
    const params = [];
    if (role) { q += ' WHERE role=$1'; params.push(role); }
    q += ' ORDER BY created_at DESC';
    const { rows } = await pool.query(q, params);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
}

async function createUser(req, res, next) {
  try {
    const { email, password, role, full_name } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users(email,password_hash,role,full_name) VALUES($1,$2,$3,$4)
       RETURNING id,email,role,full_name,created_at`,
      [email, hash, role, full_name]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ success: false, error: 'Email already exists' });
    next(err);
  }
}

async function getStats(req, res, next) {
  try {
    const { rows } = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role='student') AS students,
        (SELECT COUNT(*) FROM users WHERE role='teacher') AS teachers,
        (SELECT COUNT(*) FROM classes) AS classes,
        (SELECT COUNT(*) FROM attendance_logs) AS attendance_records,
        (SELECT COUNT(*) FROM attendance_logs WHERE status='present') AS present_count,
        (SELECT COUNT(*) FROM attendance_logs WHERE status='late') AS late_count,
        (SELECT COUNT(*) FROM attendance_logs WHERE status='absent') AS absent_count
    `);
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
}

module.exports = { getUsers, createUser, getStats };
