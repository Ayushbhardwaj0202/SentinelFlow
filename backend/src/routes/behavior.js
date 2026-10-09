const express = require('express');
const router = express.Router();
const behaviorController = require('../controllers/behaviorController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);
router.use(requireRole('admin', 'analyst'));

router.get('/', behaviorController.getAll);
router.get('/user', behaviorController.getByUser);
router.post('/', behaviorController.analyze);

module.exports = router;
