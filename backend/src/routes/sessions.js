const express = require('express');
const router = express.Router();
const sessionsController = require('../controllers/sessionsController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', sessionsController.getAll);
router.get('/:id', sessionsController.getById);
router.post('/', sessionsController.create);
router.put('/:id/end', sessionsController.endSession);

module.exports = router;
