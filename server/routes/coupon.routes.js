const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { protect, adminOnly } = require('../middleware/auth');

// @route POST /api/coupons/validate
router.post('/validate', protect, async (req, res) => {
  try {
    const { code, bookingAmount } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    if (new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ message: 'Coupon code has expired' });
    }

    if (bookingAmount < coupon.minBookingAmount) {
      return res.status(400).json({ message: `Minimum booking amount for this coupon is ₹${coupon.minBookingAmount}` });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (bookingAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    res.json({
      code: coupon.code,
      discountAmount: Math.round(discount),
      message: `Coupon applied! You saved ₹${Math.round(discount)}`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/coupons
router.get('/', async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/coupons (Admin Only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route DELETE /api/coupons/:id (Admin Only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
