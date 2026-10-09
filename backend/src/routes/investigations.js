const express = require('express');
const router = express.Router();
const investigationsController = require('../controllers/investigationsController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', investigationsController.getAll);
router.get('/:id', investigationsController.getById);
router.post('/', investigationsController.create);
router.put('/:id', investigationsController.update);
router.get('/:id/findings', investigationsController.getFindings);
router.post('/:id/findings', investigationsController.addFinding);

module.exports = router;
