const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', usersController.getAll);
router.get('/:id', usersController.getById);
router.post('/', requireRole('admin'), usersController.create);
router.put('/:id', requireRole('admin'), usersController.update);
router.delete('/:id', requireRole('admin'), usersController.deleteUser);

module.exports = router;
