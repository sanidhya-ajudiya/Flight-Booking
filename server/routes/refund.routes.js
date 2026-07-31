const express = require('express');
const router = express.Router();
const Refund = require('../models/Refund');
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');

// @route GET /api/refunds (Admin Only)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const refunds = await Refund.find()
      .populate('user', 'name email phone')
      .populate('booking', 'pnr totalAmount status')
      .sort({ createdAt: -1 });
    res.json(refunds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PATCH /api/refunds/:id/status (Admin Only)
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, adminComment } = req.body;
    const refund = await Refund.findById(req.params.id).populate('user');

    if (!refund) {
      return res.status(404).json({ message: 'Refund request not found' });
    }

    refund.status = status;
    if (adminComment) refund.adminComment = adminComment;

    if (status === 'Approved' || status === 'Processed') {
      refund.processedAt = new Date();
      // Add balance to user wallet if refund method is Wallet
      const user = await User.findById(refund.user._id);
      if (user) {
        user.walletBalance += refund.amount;
        await user.save();

        let wallet = await Wallet.findOne({ user: user._id });
        if (!wallet) {
          wallet = await Wallet.create({ user: user._id, balance: user.walletBalance, transactions: [] });
        }
        wallet.balance = user.walletBalance;
        wallet.transactions.push({
          type: 'Credit',
          amount: refund.amount,
          description: `Refund for booking (Request ID: ${refund._id})`
        });
        await wallet.save();
      }

      await Notification.create({
        user: refund.user._id,
        title: 'Refund Approved! 💰',
        message: `Your refund of ₹${refund.amount} has been credited to your wallet.`,
        type: 'Refund'
      });
    }

    await refund.save();
    res.json(refund);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
