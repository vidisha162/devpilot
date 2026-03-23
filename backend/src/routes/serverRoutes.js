const express = require('express');
const router = express.Router();
const serverController = require('../controllers/serverController');
const { protect } = require('../middleware/auth');

router.get('/health', protect, serverController.getServerHealth);
router.get('/ping/:host', protect, serverController.pingServer);
router.get('/info', protect, serverController.getSystemInfo);

module.exports = router;