const express = require('express');
const router = express.Router();
const riskController = require('../controllers/riskController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);
router.use(requireRole('admin', 'analyst'));

router.get('/', riskController.getAll);
router.get('/:id', riskController.getById);
router.post('/', riskController.create);

module.exports = router;
