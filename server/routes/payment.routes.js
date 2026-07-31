const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const { protect, adminOnly } = require('../middleware/auth');

// @route POST /api/payments/create-intent
router.post('/create-intent', protect, async (req, res) => {
  try {
    const { amount, currency, paymentMethod } = req.body;
    // Mock payment intent token for Stripe / UPI / Card
    const clientSecret = `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`;
    res.json({
      clientSecret,
      transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      amount,
      currency: currency || 'INR',
      status: 'succeeded'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/payments (Admin Only)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('user', 'name email')
      .populate('booking', 'pnr totalAmount status')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
