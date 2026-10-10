const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  flightNumber: { type: String, required: true, uppercase: true },
  airline: { type: mongoose.Schema.Types.ObjectId, ref: 'Airline', required: true },
  departureAirport: { type: mongoose.Schema.Types.ObjectId, ref: 'Airport', required: true },
  arrivalAirport: { type: mongoose.Schema.Types.ObjectId, ref: 'Airport', required: true },
  departureDate: { type: Date, required: true },
  arrivalDate: { type: Date, required: true },
  departureTime: { type: String, required: true }, // e.g. "08:30"
  arrivalTime: { type: String, required: true },   // e.g. "11:45"
  duration: { type: String, required: true },      // e.g. "3h 15m"
  stops: { type: Number, default: 0 },
  aircraftType: { type: String, default: 'Boeing 737-800' },
  economyPrice: { type: Number, required: true },
  businessPrice: { type: Number, required: true },
  firstClassPrice: { type: Number, required: true },
  totalSeats: { type: Number, default: 120 },
  availableSeats: { type: Number, default: 120 },
  occupiedSeats: [{ type: String }], // e.g. ["1A", "3C", "12B"]
  lockedSeats: [{
    seatNumber: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lockedUntil: { type: Date, required: true }
  }],
  status: { 
    type: String, 
    enum: ['Scheduled', 'Delayed', 'On-Time', 'In-Flight', 'Completed', 'Cancelled'], 
    default: 'Scheduled' 
  },
  image: { type: String, default: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80' }
}, { timestamps: true });

module.exports = mongoose.model('Flight', flightSchema);
