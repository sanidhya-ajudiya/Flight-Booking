const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const upload = require('../middleware/upload');
const { protect, adminOnly } = require('../middleware/auth');

// @route PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, nationality, passportNumber } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (nationality) user.nationality = nationality;
    if (passportNumber) user.passportNumber = passportNumber;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      nationality: updatedUser.nationality,
      passportNumber: updatedUser.passportNumber,
      avatar: updatedUser.avatar,
      walletBalance: updatedUser.walletBalance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/users/avatar
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }
    const avatarUrl = `/uploads/${req.file.filename}`;
    const user = await User.findById(req.user._id);
    user.avatar = avatarUrl;
    await user.save();
    res.json({ avatar: avatarUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/users/wallet
router.get('/wallet', protect, async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      wallet = await Wallet.create({
        user: req.user._id,
        balance: req.user.walletBalance || 500,
        transactions: [{ type: 'Credit', amount: 500, description: 'Welcome Bonus' }]
      });
    }
    res.json(wallet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/users/passengers
router.post('/passengers', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.savedPassengers.push(req.body);
    await user.save();
    res.json(user.savedPassengers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/users (Admin Only)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route DELETE /api/users/:id (Admin Only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
