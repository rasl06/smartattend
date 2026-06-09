const router = require('express').Router();
const { pool } = require('../config/db');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM subjects ORDER BY name');
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
});

router.get('/groups', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT g.*, d.name AS department_name
       FROM groups g LEFT JOIN departments d ON d.id = g.department_id
       ORDER BY g.name`
    );
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
});

module.exports = router;
