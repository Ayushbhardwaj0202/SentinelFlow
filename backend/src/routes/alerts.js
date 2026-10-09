const express = require('express');
const router = express.Router();
const alertsController = require('../controllers/alertsController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', alertsController.getAll);
router.get('/:id', alertsController.getById);
router.post('/', alertsController.create);
router.put('/:id', alertsController.update);

module.exports = router;
