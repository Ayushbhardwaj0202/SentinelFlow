const express = require('express');
const router = express.Router();
const devicesController = require('../controllers/devicesController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', devicesController.getAll);
router.get('/:id', devicesController.getById);
router.post('/', devicesController.create);
router.put('/:id', devicesController.update);
router.delete('/:id', devicesController.deleteDevice);

module.exports = router;
