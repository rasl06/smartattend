const router = require('express').Router();
const ctrl   = require('../controllers/classes.controller');
const qrCtrl = require('../controllers/qr.controller');
const attCtrl = require('../controllers/attendance.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/',     ctrl.getClasses);
router.post('/',    authorize('teacher','admin'), ctrl.createClass);
router.get('/:id',  ctrl.getClass);
router.get('/:id/qr', authorize('teacher','admin'), qrCtrl.generateQR);
router.get('/:id/attendance', authorize('teacher','admin'), attCtrl.classAttendance);

module.exports = router;
