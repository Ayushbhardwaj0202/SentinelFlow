const express = require('express');
const router = express.Router();
const threatsController = require('../controllers/threatsController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', threatsController.getAll);
router.get('/:id', threatsController.getById);
router.post('/', threatsController.create);
router.put('/:id', threatsController.update);

module.exports = router;
