const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');

// @route GET /api/notifications
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PATCH /api/notifications/:id/read
router.patch('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/notifications/broadcast (Admin Only)
router.post('/broadcast', protect, adminOnly, async (req, res) => {
  try {
    const { title, message, type } = req.body;
    // Notify all customers
    const User = require('../models/User');
    const users = await User.find({ role: 'customer' });
    const docs = users.map(u => ({
      user: u._id,
      title,
      message,
      type: type || 'Offer'
    }));
    await Notification.insertMany(docs);
    res.json({ message: `Broadcast sent to ${users.length} users` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
