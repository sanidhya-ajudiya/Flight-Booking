const express = require('express');
const {
  createBooking,
  getMyBookings,
  cancelBooking,
  getBookingByRef
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post((req, res, next) => {
    // Optional Authentication wrapper for booking
    if (req.headers.authorization) {
      return protect(req, res, next);
    }
    next();
  }, createBooking);

router.get('/my-bookings', protect, getMyBookings);
router.post('/:id/cancel', cancelBooking);
router.get('/ref/:ref', getBookingByRef);

module.exports = router;
