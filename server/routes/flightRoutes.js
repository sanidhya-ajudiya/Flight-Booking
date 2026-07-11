const express = require('express');
const {
  searchFlights,
  getFlightById,
  getAllFlights,
  createFlight,
  updateFlight,
  deleteFlight
} = require('../controllers/flightController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/search', searchFlights);
router.get('/:id', getFlightById);

router.route('/')
  .get(protect, authorize('admin'), getAllFlights)
  .post(protect, authorize('admin'), createFlight);

router.route('/:id')
  .put(protect, authorize('admin'), updateFlight)
  .delete(protect, authorize('admin'), deleteFlight);

module.exports = router;
