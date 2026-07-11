const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  uploadAvatar,
  verifyEmail,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateResult } = require('../middleware/validate');
const upload = require('../middleware/upload');

const router = express.Router();

router.post(
  '/register',
  [
    body('firstName', 'First name is required').notEmpty().trim(),
    body('lastName', 'Last name is required').notEmpty().trim(),
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    validateResult
  ],
  register
);

router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists(),
    validateResult
  ],
  login
);

router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', body('email', 'Please include a valid email').isEmail(), validateResult, forgotPassword);
router.post('/reset-password', body('password', 'Password must be 6 or more characters').isLength({ min: 6 }), validateResult, resetPassword);

module.exports = router;
