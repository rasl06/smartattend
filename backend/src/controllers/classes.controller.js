const { pool } = require('../config/db');

/** Получить список занятий преподавателя */
async function getClasses(req, res, next) {
  try {
    const teacherId = req.user.role === 'admin' ? (req.query.teacherId || null) : req.user.id;
    let query, params;
    if (teacherId) {
      query = `SELECT c.*, s.name AS subject_name, s.code AS subject_code,
                      array_agg(g.name) AS group_names
               FROM classes c
               JOIN subjects s ON s.id = c.subject_id
               LEFT JOIN class_groups cg ON cg.class_id = c.id
               LEFT JOIN groups g ON g.id = cg.group_id
               WHERE c.teacher_id = $1
               GROUP BY c.id, s.name, s.code
               ORDER BY c.starts_at DESC LIMIT 50`;
      params = [teacherId];
    } else {
      query = `SELECT c.*, s.name AS subject_name, s.code AS subject_code,
                      u.full_name AS teacher_name,
                      array_agg(g.name) AS group_names
               FROM classes c
               JOIN subjects s ON s.id = c.subject_id
               JOIN users u ON u.id = c.teacher_id
               LEFT JOIN class_groups cg ON cg.class_id = c.id
               LEFT JOIN groups g ON g.id = cg.group_id
               GROUP BY c.id, s.name, s.code, u.full_name
               ORDER BY c.starts_at DESC LIMIT 100`;
      params = [];
    }
    const { rows } = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
}

/** Создать занятие */
async function createClass(req, res, next) {
  try {
    const { subject_id, room, lat, lng, starts_at, ends_at, group_ids } = req.body;
    const teacher_id = req.user.role === 'teacher' ? req.user.id : req.body.teacher_id;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query(
        `INSERT INTO classes (subject_id,teacher_id,room,lat,lng,starts_at,ends_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [subject_id, teacher_id, room, lat || null, lng || null, starts_at, ends_at]
      );
      const classId = rows[0].id;
      if (group_ids?.length) {
        for (const gid of group_ids) {
          await client.query(
            'INSERT INTO class_groups(class_id,group_id) VALUES($1,$2) ON CONFLICT DO NOTHING',
            [classId, gid]
          );
        }
      }
      await client.query('COMMIT');
      res.status(201).json({ success: true, data: rows[0] });
    } catch (e) { await client.query('ROLLBACK'); throw e; }
    finally { client.release(); }
  } catch (err) { next(err); }
}

/** Получить одно занятие */
async function getClass(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT c.*, s.name AS subject_name, u.full_name AS teacher_name,
              array_agg(g.name) AS group_names
       FROM classes c
       JOIN subjects s ON s.id = c.subject_id
       JOIN users u ON u.id = c.teacher_id
       LEFT JOIN class_groups cg ON cg.class_id = c.id
       LEFT JOIN groups g ON g.id = cg.group_id
       WHERE c.id = $1
       GROUP BY c.id, s.name, u.full_name`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, error: 'Class not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
}

module.exports = { getClasses, createClass, getClass };
