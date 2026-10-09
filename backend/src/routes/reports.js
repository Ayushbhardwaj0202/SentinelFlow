const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);
router.use(requireRole('admin', 'analyst'));

router.get('/', reportsController.getAll);
router.get('/:id', reportsController.getById);
router.post('/generate', reportsController.generate);

module.exports = router;
