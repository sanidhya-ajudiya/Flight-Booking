const express = require('express');
const {
  getAirports,
  createAirport,
  updateAirport,
  deleteAirport
} = require('../controllers/airportController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getAirports)
  .post(protect, authorize('admin'), createAirport);

router.route('/:id')
  .put(protect, authorize('admin'), updateAirport)
  .delete(protect, authorize('admin'), deleteAirport);

module.exports = router;
