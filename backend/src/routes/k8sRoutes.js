const express = require('express');
const router = express.Router();
const k8sController = require('../controllers/k8sController');
const { protect } = require('../middleware/auth');

router.get('/info', protect, k8sController.getClusterInfo);
router.get('/nodes', protect, k8sController.getNodes);
router.get('/pods', protect, k8sController.getPods);
router.get('/namespaces', protect, k8sController.getNamespaces);
router.get('/deployments', protect, k8sController.getDeployments);
router.get('/services', protect, k8sController.getServices);
router.post('/deploy', protect, k8sController.deployApp);
router.delete('/delete/:namespace/:appName', protect, k8sController.deleteApp);
router.patch('/scale/:namespace/:appName', protect, k8sController.scaleApp);

module.exports = router;