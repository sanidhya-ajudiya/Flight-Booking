const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const User = require('../models/User');
const { sendMail } = require('../services/emailService');

// Helper: Generate Unique Alphanumeric String
const generateRef = (prefix = 'SKY', length = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix;
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// @desc    Create Booking
// @route   POST /api/bookings
// @access  Public (Optional Auth)
exports.createBooking = async (req, res, next) => {
  try {
    const {
      flightId,
      passengers,
      contactEmail,
      contactPhone,
      cabinClass = 'economy',
      coupon,
      discount = 0
    } = req.body;

    const flight = await Flight.findById(flightId).populate('airline').populate('origin').populate('destination');
    if (!flight) {
      return res.status(404).json({ success: false, message: 'Flight not found' });
    }

    // Verify seats availability
    const passengersCount = passengers.length;
    const currentBookedCount = flight.seatsBooked && flight.seatsBooked[cabinClass] ? flight.seatsBooked[cabinClass].length : 0;
    const totalSeatsLimit = flight.seats[cabinClass] || 0;

    if (currentBookedCount + passengersCount > totalSeatsLimit) {
      return res.status(400).json({ success: false, message: 'Not enough seats available in this cabin class' });
    }

    // Generate Booking References
    const bookingRef = generateRef('SKY', 6);
    const pnr = generateRef('PNR', 6);

    // Calculate Prices
    const basePrice = (flight.prices[cabinClass] || flight.prices.economy) * passengersCount;
    const taxes = Math.round(basePrice * 0.18);
    const gst = Math.round(basePrice * 0.05);
    const subtotal = basePrice + taxes + gst;
    const total = Math.max(0, subtotal - discount);

    const bookingPrice = {
      base: basePrice,
      taxes,
      gst,
      total,
      currency: 'INR',
      pricePerPassenger: Math.round(total / passengersCount)
    };

    // Update Seat Bookings in Flight
    const reservedSeats = [];
    passengers.forEach((p, idx) => {
      // If seatId is specified, reserve it; otherwise, auto-assign
      let seatId = p.seatId;
      if (!seatId) {
        seatId = `${cabinClass.charAt(0).toUpperCase()}${currentBookedCount + idx + 1}`;
        p.seatId = seatId;
      }
      reservedSeats.push(seatId);
    });

    if (!flight.seatsBooked[cabinClass]) {
      flight.seatsBooked[cabinClass] = [];
    }
    flight.seatsBooked[cabinClass].push(...reservedSeats);
    await flight.save();

    // Create Booking
    const bookingData = {
      bookingRef,
      pnr,
      flight: flight._id,
      passengers,
      totalPrice: bookingPrice,
      contactEmail,
      contactPhone,
      coupon,
      discount,
      status: 'confirmed',
      payment: {
        method: 'card',
        status: 'success',
        amount: total,
        paidAt: new Date(),
        transactionId: 'TXN-' + Date.now() + Math.random().toString(36).substring(2, 6).toUpperCase()
      }
    };

    // Associate user if logged in
    if (req.user) {
      bookingData.user = req.user.id;

      // Update User's saved passengers if any new passenger is not already saved
      const user = await User.findById(req.user.id);
      if (user) {
        passengers.forEach(newP => {
          const exists = user.savedPassengers.some(p => 
            p.firstName.toLowerCase() === newP.firstName.toLowerCase() && 
            p.lastName.toLowerCase() === newP.lastName.toLowerCase()
          );
          if (!exists) {
            user.savedPassengers.push(newP);
          }
        });
        await user.save();
      }
    }

    const booking = await Booking.create(bookingData);

    // Send Booking Confirmation Email
    const emailBody = `
      <h3>Flight Booking Confirmed!</h3>
      <p>Thank you for choosing SkyWings. Your booking is confirmed.</p>
      <p><strong>Booking Ref:</strong> ${bookingRef}</p>
      <p><strong>PNR:</strong> ${pnr}</p>
      <p><strong>Route:</strong> ${flight.origin.city} (${flight.origin.code}) &rarr; ${flight.destination.city} (${flight.destination.code})</p>
      <p><strong>Departure Time:</strong> ${new Date(flight.departureTime).toLocaleString()}</p>
      <p><strong>Total Fare:</strong> ₹${total.toLocaleString()}</p>
      <p>Have a safe flight!</p>
    `;

    await sendMail({
      email: contactEmail,
      subject: `SkyWings Flight Booking Confirmed - ${bookingRef}`,
      message: `Your booking ${bookingRef} has been confirmed. PNR: ${pnr}. Route: ${flight.origin.city} to ${flight.destination.city}. departure: ${new Date(flight.departureTime).toLocaleString()}.`,
      html: emailBody
    });

    // Populate flight details for client return
    const populatedBooking = await Booking.findById(booking._id).populate({
      path: 'flight',
      populate: [
        { path: 'airline' },
        { path: 'origin' },
        { path: 'destination' }
      ]
    });

    res.status(201).json({ success: true, data: populatedBooking });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Current User's Bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate({
        path: 'flight',
        populate: [
          { path: 'airline' },
          { path: 'origin' },
          { path: 'destination' }
        ]
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel Booking
// @route   POST /api/bookings/:id/cancel
// @access  Public (or Private)
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('flight');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    // Free up seats in Flight
    const flight = booking.flight;
    if (flight) {
      const cabinClass = booking.passengers[0]?.seatId?.startsWith('E') ? 'economy'
                       : booking.passengers[0]?.seatId?.startsWith('B') ? 'business'
                       : booking.passengers[0]?.seatId?.startsWith('F') ? 'first'
                       : 'economy';

      const seatsToFree = booking.passengers.map(p => p.seatId).filter(Boolean);

      flight.seatsBooked[cabinClass] = flight.seatsBooked[cabinClass].filter(
        seat => !seatsToFree.includes(seat)
      );

      await flight.save();
    }

    // Cancel Booking
    booking.status = 'cancelled';
    booking.payment.status = 'failed';
    booking.payment.refundStatus = 'refunded';
    await booking.save();

    // Send Cancellation Email
    await sendMail({
      email: booking.contactEmail,
      subject: `SkyWings Booking Cancellation - ${booking.bookingRef}`,
      message: `Your booking ${booking.bookingRef} has been cancelled successfully. Your refund has been initiated.`,
      html: `
        <h3>Booking Cancelled</h3>
        <p>Your booking <strong>${booking.bookingRef}</strong> has been cancelled successfully.</p>
        <p>A full refund of ₹${booking.totalPrice.total.toLocaleString()} has been initiated to your original payment method.</p>
      `
    });

    res.status(200).json({ success: true, message: 'Booking cancelled and refund initiated.', data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Booking by Reference
// @route   GET /api/bookings/ref/:ref
// @access  Public
exports.getBookingByRef = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ bookingRef: req.params.ref.toUpperCase() })
      .populate({
        path: 'flight',
        populate: [
          { path: 'airline' },
          { path: 'origin' },
          { path: 'destination' }
        ]
      });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};
