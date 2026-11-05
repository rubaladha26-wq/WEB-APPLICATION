const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
  getAuditLogs,
} = require('../controllers/settingController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router
  .route('/')
  .get(getSettings)
  .put(authorize('Admin'), updateSettings);

router.get('/audit-logs', authorize('Admin'), getAuditLogs);

module.exports = router;

