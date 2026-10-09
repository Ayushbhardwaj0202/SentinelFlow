const express = require('express');
const router = express.Router();
const activitiesController = require('../controllers/activitiesController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', activitiesController.getAll);
router.get('/:id', activitiesController.getById);
router.post('/', activitiesController.create);

module.exports = router;
