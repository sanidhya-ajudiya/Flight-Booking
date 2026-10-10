const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  dob: { type: Date, required: true },
  passportNumber: { type: String, default: '' },
  nationality: { type: String, default: 'Indian' },
  seatNumber: { type: String, required: true },
  extraBaggageKg: { type: Number, default: 0 },
  isCheckedIn: { type: Boolean, default: false },
  boardingPassNumber: { type: String, default: '' },
  gate: { type: String, default: 'G12' }
});

const bookingSchema = new mongoose.Schema({
  pnr: { type: String, required: true, unique: true, uppercase: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
  tripType: { type: String, enum: ['one-way', 'round-trip', 'multi-city'], default: 'one-way' },
  returnFlight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', default: null },
  cabinClass: { type: String, enum: ['economy', 'business', 'firstClass'], default: 'economy' },
  passengers: [passengerSchema],
  baseFare: { type: Number, required: true },
  taxAmount: { type: Number, default: 0 },
  extraBaggageFee: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  couponCode: { type: String, default: '' },
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Confirmed', 'Cancelled', 'Completed', 'Refunded'], 
    default: 'Confirmed' 
  },
  paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Failed', 'Refunded'], default: 'Paid' },
  paymentId: { type: String, default: '' },
  paymentMethod: { type: String, default: 'Card' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
