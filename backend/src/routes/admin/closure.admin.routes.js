const express = require('express');

const closureAdminController = require('../../controllers/admin/closure.admin.controller');

const router = express.Router();

router.get('/', closureAdminController.getClosures);
router.get('/:id', closureAdminController.getClosureById);
router.post('/close', closureAdminController.closeActiveBatch);

module.exports = router;
