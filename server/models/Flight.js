const mongoose = require('mongoose');

const StopDetailSchema = new mongoose.Schema({
  airport: { type: mongoose.Schema.Types.ObjectId, ref: 'Airport' },
  layoverDuration: { type: Number } // in minutes
}, { _id: false });

const FlightSchema = new mongoose.Schema({
  flightNumber: { type: String, required: true, uppercase: true, index: true },
  airline: { type: mongoose.Schema.Types.ObjectId, ref: 'Airline', required: true },
  origin: { type: mongoose.Schema.Types.ObjectId, ref: 'Airport', required: true },
  destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Airport', required: true },
  departureTime: { type: Date, required: true },
  arrivalTime: { type: Date, required: true },
  duration: { type: Number, required: true }, // in minutes
  aircraft: { type: String, default: 'Airbus A320' },
  stops: { type: Number, default: 0 },
  stopDetails: [StopDetailSchema],
  baggageAllowance: {
    cabin: { type: String, default: '7 kg' },
    checkedIn: { type: String, default: '15 kg' },
    carryOn: { type: String, default: '1 piece' }
  },
  prices: {
    economy: { type: Number, required: true },
    premium_economy: { type: Number },
    business: { type: Number },
    first: { type: Number }
  },
  seats: {
    economy: { type: Number, default: 120 },
    premium_economy: { type: Number, default: 20 },
    business: { type: Number, default: 20 },
    first: { type: Number, default: 10 }
  },
  seatsBooked: {
    economy: { type: [String], default: [] },
    premium_economy: { type: [String], default: [] },
    business: { type: [String], default: [] },
    first: { type: [String], default: [] }
  },
  refundable: { type: Boolean, default: true },
  fareType: { type: String, enum: ['Saver', 'Flexi'], default: 'Saver' },
  amenities: { type: [String], default: [] },
  rating: { type: Number, default: 4.0 },
  onTimePerformance: { type: Number, default: 90 },
  status: { type: String, enum: ['scheduled', 'delayed', 'cancelled', 'completed'], default: 'scheduled' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Flight', FlightSchema);
