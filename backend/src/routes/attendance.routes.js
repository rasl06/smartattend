const router  = require('express').Router();
const ctrl    = require('../controllers/attendance.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.post('/scan', authorize('student'), ctrl.scan);
router.get('/my',    authorize('student'), ctrl.myAttendance);

module.exports = router;
