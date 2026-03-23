const express = require('express');
const router = express.Router();
const dockerController = require('../controllers/dockerController');
const { protect } = require('../middleware/auth');

router.get('/containers', protect, dockerController.listContainers);
router.post('/containers/:id/start', protect, dockerController.startContainer);
router.post('/containers/:id/stop', protect, dockerController.stopContainer);
router.get('/containers/:id/logs', protect, dockerController.getContainerLogs);
router.get('/containers/:id/stats', protect, dockerController.getContainerStats);

module.exports = router;  
