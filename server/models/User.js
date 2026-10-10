const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin', 'staff'], default: 'customer' },
  phone: { type: String, default: '' },
  nationality: { type: String, default: 'Indian' },
  passportNumber: { type: String, default: '' },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80' },
  walletBalance: { type: Number, default: 500 }, // Default promotional bonus
  savedPassengers: [{
    name: String,
    gender: String,
    dob: Date,
    passportNumber: String,
    nationality: String,
    phone: String
  }],
  refreshToken: { type: String, default: null },
  resetPasswordOTP: { type: String, default: null },
  resetPasswordExpire: { type: Date, default: null },
  isVerified: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
