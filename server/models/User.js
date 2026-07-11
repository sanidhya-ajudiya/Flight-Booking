const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const PassengerSchema = new mongoose.Schema({
  type: { type: String, enum: ['adult', 'child', 'infant'], default: 'adult' },
  title: { type: String },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: String },
  nationality: { type: String },
  passportNumber: { type: String },
  passportExpiry: { type: String },
  email: { type: String },
  phone: { type: String },
  specialAssistance: { type: String },
  mealPreference: { type: String },
  seatId: { type: String }
});

const UserPreferencesSchema = new mongoose.Schema({
  language: { type: String, default: 'en' },
  currency: { type: String, default: 'INR' },
  notifications: { type: Boolean, default: true },
  theme: { type: String, enum: ['light', 'dark'], default: 'light' }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  phone: { type: String },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  address: { type: String },
  country: { type: String },
  state: { type: String },
  city: { type: String },
  pincode: { type: String },
  passportNumber: { type: String },
  dateOfBirth: { type: String },
  savedPassengers: [PassengerSchema],
  preferences: { type: UserPreferencesSchema, default: () => ({}) },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Full name virtual
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
