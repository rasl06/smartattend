const router = require('express').Router();
const ctrl   = require('../controllers/users.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin'));

router.get('/',      ctrl.getUsers);
router.post('/',     ctrl.createUser);
router.get('/stats', ctrl.getStats);

module.exports = router;
