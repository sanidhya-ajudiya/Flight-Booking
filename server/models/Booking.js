const mongoose = require('mongoose');

const PassengerDetailSchema = new mongoose.Schema({
  type: { type: String, enum: ['adult', 'child', 'infant'], default: 'adult' },
  title: { type: String },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: String },
  nationality: { type: String },
  passportNumber: { type: String },
  email: { type: String },
  phone: { type: String },
  specialAssistance: { type: String },
  mealPreference: { type: String },
  seatId: { type: String }
}, { _id: false });

const BookingSchema = new mongoose.Schema({
  bookingRef: { type: String, required: true, unique: true, uppercase: true, index: true },
  pnr: { type: String, required: true, unique: true, uppercase: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['confirmed', 'pending', 'cancelled', 'completed'], default: 'confirmed' },
  flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
  returnFlight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight' },
  passengers: [PassengerDetailSchema],
  totalPrice: {
    base: { type: Number, required: true },
    taxes: { type: Number, required: true },
    gst: { type: Number, required: true },
    total: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    pricePerPassenger: { type: Number }
  },
  payment: {
    method: { type: String, enum: ['card', 'upi', 'netbanking', 'wallet'], default: 'card' },
    transactionId: { type: String },
    status: { type: String, enum: ['success', 'failed', 'pending'], default: 'success' },
    amount: { type: Number },
    paidAt: { type: Date }
  },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, required: true },
  coupon: { type: String },
  discount: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', BookingSchema);
