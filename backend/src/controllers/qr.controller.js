const qrService = require('../services/qr.service');
const { pool }   = require('../config/db');

/** Генерация QR-кода для занятия */
async function generateQR(req, res, next) {
  try {
    const { id: classId } = req.params;

    // Проверяем, что преподаватель ведёт это занятие
    if (req.user.role === 'teacher') {
      const { rows } = await pool.query(
        'SELECT id FROM classes WHERE id=$1 AND teacher_id=$2', [classId, req.user.id]
      );
      if (!rows.length) return res.status(403).json({ success: false, error: 'Not your class' });
    }

    const result = await qrService.generateQRToken(classId);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

module.exports = { generateQR };
