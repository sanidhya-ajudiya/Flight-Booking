const express = require('express');
const {
  getAirlines,
  createAirline,
  updateAirline,
  deleteAirline
} = require('../controllers/airlineController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getAirlines)
  .post(protect, authorize('admin'), createAirline);

router.route('/:id')
  .put(protect, authorize('admin'), updateAirline)
  .delete(protect, authorize('admin'), deleteAirline);

module.exports = router;
