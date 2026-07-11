const express = require('express');
const { getDashboardStats, exportReport } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply admin protection to all routes in this file
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/reports/:type/export', exportReport);

module.exports = router;
