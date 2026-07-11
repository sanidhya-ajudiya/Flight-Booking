const express = require('express');
const {
  createStripePaymentIntent,
  createRazorpayOrder,
  verifyRazorpayPayment,
  createPaypalOrder,
  capturePaypalOrder
} = require('../controllers/paymentController');

const router = express.Router();

// Stripe
router.post('/stripe/create-payment-intent', createStripePaymentIntent);

// Razorpay
router.post('/razorpay/order', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);

// PayPal
router.post('/paypal/order', createPaypalOrder);
router.post('/paypal/capture', capturePaypalOrder);

module.exports = router;
