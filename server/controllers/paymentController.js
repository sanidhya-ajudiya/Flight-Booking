const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

// Helper: Generate Random transaction ID
const generateTxnId = (prefix = 'TXN') => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
};

// @desc    Stripe Create Payment Intent
// @route   POST /api/payments/stripe/create-payment-intent
// @access  Public
exports.createStripePaymentIntent = async (req, res, next) => {
  try {
    const { amount, currency = 'INR', bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const transactionId = generateTxnId('STRIPE');

    // Create payment log
    const payment = await Payment.create({
      transactionId,
      booking: bookingId,
      amount,
      currency,
      method: 'card',
      status: 'success'
    });

    // Update Booking status
    booking.payment = {
      method: 'card',
      transactionId,
      status: 'success',
      amount,
      paidAt: new Date()
    };
    booking.status = 'confirmed';
    await booking.save();

    res.status(200).json({
      success: true,
      clientSecret: 'mock_stripe_client_secret_secret_' + Math.random().toString(36).substring(2, 10),
      payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Razorpay Create Order
// @route   POST /api/payments/razorpay/order
// @access  Public
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount, currency = 'INR', bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const razorpayOrderId = 'order_' + Math.random().toString(36).substring(2, 12).toUpperCase();

    res.status(200).json({
      success: true,
      id: razorpayOrderId,
      entity: 'order',
      amount: amount * 100, // razorpay expects paise
      currency,
      receipt: 'receipt_' + bookingId
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Razorpay Verify Payment
// @route   POST /api/payments/razorpay/verify
// @access  Public
exports.verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId, amount } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Mock signature verification
    const transactionId = razorpay_payment_id || generateTxnId('RPAY');

    // Create payment log
    const payment = await Payment.create({
      transactionId,
      booking: bookingId,
      amount,
      currency: 'INR',
      method: 'upi',
      status: 'success'
    });

    // Update booking status
    booking.payment = {
      method: 'upi',
      transactionId,
      status: 'success',
      amount,
      paidAt: new Date()
    };
    booking.status = 'confirmed';
    await booking.save();

    res.status(200).json({ success: true, message: 'Payment verified and updated successfully', payment });
  } catch (error) {
    next(error);
  }
};

// @desc    PayPal Create Order
// @route   POST /api/payments/paypal/order
// @access  Public
exports.createPaypalOrder = async (req, res, next) => {
  try {
    const { amount, currency = 'USD', bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const orderId = 'paypal_' + Math.random().toString(36).substring(2, 12).toUpperCase();

    res.status(200).json({
      success: true,
      id: orderId,
      status: 'CREATED'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    PayPal Capture Order
// @route   POST /api/payments/paypal/capture
// @access  Public
exports.capturePaypalOrder = async (req, res, next) => {
  try {
    const { orderId, bookingId, amount } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const transactionId = generateTxnId('PAYPAL');

    // Create payment log
    const payment = await Payment.create({
      transactionId,
      booking: bookingId,
      amount,
      currency: 'INR',
      method: 'wallet',
      status: 'success'
    });

    // Update booking
    booking.payment = {
      method: 'wallet',
      transactionId,
      status: 'success',
      amount,
      paidAt: new Date()
    };
    booking.status = 'confirmed';
    await booking.save();

    res.status(200).json({ success: true, status: 'COMPLETED', payment });
  } catch (error) {
    next(error);
  }
};
