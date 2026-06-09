const attendanceService = require('../services/attendance.service');
const { verifyQRToken } = require('../services/qr.service');
const { validateScan }  = require('../validators/attendance.validator');

/** POST /api/v1/attendance/scan — студент сканирует QR */
async function scan(req, res, next) {
  try {
    const { error, value } = validateScan(req.body);
    if (error) {
      return res.status(400).json({
        success: false, error: 'Validation error',
        details: error.details.map((d) => d.message),
      });
    }
    const { token, classId, latitude, longitude, deviceFingerprint } = value;
    const studentId = req.user.id;

    await verifyQRToken(token, classId);
    await attendanceService.checkGeoFence(classId, latitude, longitude);
    await attendanceService.checkDeviceBinding(studentId, deviceFingerprint);

    const already = await attendanceService.isAlreadyMarked(classId, studentId);
    if (already) return res.status(409).json({ success: false, error: 'Already registered' });

    const status = await attendanceService.resolveStatus(classId);
    const record = await attendanceService.createLog({
      classId, studentId, status, latitude, longitude,
      deviceFingerprint, ip: req.ip,
    });

    res.status(201).json({ success: true, data: { status, record } });
  } catch (err) { next(err); }
}

/** GET /api/v1/attendance/my — история студента */
async function myAttendance(req, res, next) {
  try {
    const [stats, history] = await Promise.all([
      attendanceService.getStudentStats(req.user.id),
      attendanceService.getStudentHistory(req.user.id),
    ]);
    res.json({ success: true, data: { stats, history } });
  } catch (err) { next(err); }
}

/** GET /api/v1/classes/:id/attendance — журнал занятия */
async function classAttendance(req, res, next) {
  try {
    const records = await attendanceService.getClassAttendance(req.params.id);
    res.json({ success: true, data: records });
  } catch (err) { next(err); }
}

module.exports = { scan, myAttendance, classAttendance };
