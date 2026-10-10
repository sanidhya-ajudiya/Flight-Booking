const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const Payment = require('../models/Payment');
const Refund = require('../models/Refund');
const Notification = require('../models/Notification');
const generateTicketPDF = require('../utils/pdfGenerator');
const { generateTicketPDFBuffer } = require('../utils/pdfGenerator');
const { sendBookingConfirmation } = require('../utils/emailService');
const { protect, adminOnly } = require('../middleware/auth');

const generatePNR = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let pnr = '';
  for (let i = 0; i < 6; i++) {
    pnr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pnr;
};

// @route POST /api/bookings
router.post('/', protect, async (req, res) => {
  try {
    const { flightId, tripType, returnFlightId, cabinClass, passengers, baseFare, taxAmount, extraBaggageFee, discountAmount, couponCode, totalAmount, paymentMethod } = req.body;

    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    if (flight.availableSeats < passengers.length) {
      return res.status(400).json({ message: 'Not enough seats available on this flight' });
    }

    // Process Wallet Payment deduction if Wallet method selected
    if (paymentMethod === 'Wallet') {
      if (req.user.walletBalance < totalAmount) {
        return res.status(400).json({ message: `Insufficient wallet balance. Available: ₹${req.user.walletBalance}, Required: ₹${totalAmount}` });
      }
      req.user.walletBalance -= totalAmount;
      await req.user.save();

      let wallet = await Wallet.findOne({ user: req.user._id });
      if (wallet) {
        wallet.balance = req.user.walletBalance;
        wallet.transactions.push({
          type: 'Debit',
          amount: totalAmount,
          description: `Flight Booking Payment (${flight.flightNumber})`
        });
        await wallet.save();
      }
    }

    const pnr = generatePNR();

    // Extract selected seats & add to occupiedSeats
    const newSeats = passengers.map(p => p.seatNumber);
    flight.occupiedSeats = [...flight.occupiedSeats, ...newSeats];
    flight.availableSeats = Math.max(0, flight.availableSeats - passengers.length);
    await flight.save();

    const booking = new Booking({
      pnr,
      user: req.user._id,
      flight: flightId,
      tripType: tripType || 'one-way',
      returnFlight: returnFlightId || null,
      cabinClass: cabinClass || 'economy',
      passengers,
      baseFare,
      taxAmount: taxAmount || 0,
      extraBaggageFee: extraBaggageFee || 0,
      discountAmount: discountAmount || 0,
      couponCode: couponCode || '',
      totalAmount,
      paymentMethod: paymentMethod || 'Card',
      status: 'Confirmed',
      paymentStatus: 'Paid',
      paymentId: `PAY-${Date.now()}`
    });

    const savedBooking = await booking.save();

    // Create payment record
    await Payment.create({
      booking: savedBooking._id,
      user: req.user._id,
      amount: totalAmount,
      paymentMethod: paymentMethod || 'Card',
      transactionId: savedBooking.paymentId,
      status: 'Completed'
    });

    // Create notification
    await Notification.create({
      user: req.user._id,
      title: 'Booking Confirmed! ✈️',
      message: `Your booking for Flight ${flight.flightNumber} (PNR: ${pnr}) has been confirmed!`,
      type: 'Booking'
    });

    const populated = await Booking.findById(savedBooking._id)
      .populate({
        path: 'flight',
        populate: ['airline', 'departureAirport', 'arrivalAirport']
      });

    // Send Confirmation Email with PDF Attachment asynchronously
    generateTicketPDFBuffer(populated)
      .then(pdfBuf => {
        sendBookingConfirmation(req.user.email, req.user.name, populated, pdfBuf);
      })
      .catch(err => {
        console.error('Failed to generate PDF for email:', err.message);
        sendBookingConfirmation(req.user.email, req.user.name, populated, null);
      });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/bookings/my-bookings
router.get('/my-bookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate({
        path: 'flight',
        populate: ['airline', 'departureAirport', 'arrivalAirport']
      })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/bookings (Admin Only)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email phone')
      .populate({
        path: 'flight',
        populate: ['airline', 'departureAirport', 'arrivalAirport']
      })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/bookings/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate({
        path: 'flight',
        populate: ['airline', 'departureAirport', 'arrivalAirport']
      });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // IDOR Check: Ensure booking belongs to logged in user or user is admin
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: You do not own this booking' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/bookings/:id/pdf
router.get('/:id/pdf', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'flight',
        populate: ['airline', 'departureAirport', 'arrivalAirport']
      });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // IDOR Check
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: You do not own this booking' });
    }

    generateTicketPDF(booking, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/bookings/:id/cancel
router.post('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // IDOR Check
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: You do not own this booking' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    booking.status = 'Cancelled';
    booking.paymentStatus = 'Refunded';
    await booking.save();

    // Free up seats on flight
    const flight = await Flight.findById(booking.flight);
    if (flight) {
      const seatsToFree = booking.passengers.map(p => p.seatNumber);
      flight.occupiedSeats = flight.occupiedSeats.filter(seat => !seatsToFree.includes(seat));
      flight.availableSeats += booking.passengers.length;
      await flight.save();
    }

    // Automatically create Refund Request
    const refund = await Refund.create({
      booking: booking._id,
      user: req.user._id,
      amount: Math.round(booking.totalAmount * 0.9), // 90% refund after 10% fee
      reason: req.body.reason || 'User cancelled flight booking',
      status: 'Approved' // auto-approve for user convenience
    });

    // Credit user's wallet
    req.user.walletBalance += refund.amount;
    await req.user.save();

    // Create Notification
    await Notification.create({
      user: req.user._id,
      title: 'Booking Cancelled ❌',
      message: `Booking ${booking.pnr} cancelled. ₹${refund.amount} has been refunded to your wallet.`,
      type: 'Cancellation'
    });

    res.json({ message: 'Booking cancelled successfully. Refund credited to wallet.', booking, refund });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/bookings/lookup/:pnr (Public PNR lookup for Web Check-in & Status)
router.get('/lookup/:pnr', async (req, res) => {
  try {
    const booking = await Booking.findOne({ pnr: req.params.pnr.toUpperCase().trim() })
      .populate({
        path: 'flight',
        populate: ['airline', 'departureAirport', 'arrivalAirport']
      });

    if (!booking) {
      return res.status(404).json({ message: 'No booking found with this PNR number' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/bookings/check-in (Web Check-in & Boarding Pass Issuance)
router.post('/check-in', async (req, res) => {
  try {
    const { pnr, passengerIndex } = req.body;
    const booking = await Booking.findOne({ pnr: pnr.toUpperCase().trim() })
      .populate({
        path: 'flight',
        populate: ['airline', 'departureAirport', 'arrivalAirport']
      });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ message: 'Cannot check in for a cancelled booking' });
    }

    const pIdx = passengerIndex !== undefined ? Number(passengerIndex) : 0;
    if (!booking.passengers[pIdx]) {
      return res.status(400).json({ message: 'Passenger not found' });
    }

    const passenger = booking.passengers[pIdx];
    passenger.isCheckedIn = true;
    passenger.boardingPassNumber = `BP-${booking.pnr}-${pIdx + 1}`;
    passenger.gate = 'G' + (Math.floor(Math.random() * 15) + 1);

    await booking.save();

    res.json({
      message: 'Web check-in completed successfully!',
      passenger,
      booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
