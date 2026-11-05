const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getReportsAnalytics,
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/analytics', getReportsAnalytics);

module.exports = router;

