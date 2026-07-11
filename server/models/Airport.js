const mongoose = require('mongoose');

const AirportSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, index: true },
  name: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  countryCode: { type: String, required: true, uppercase: true },
  timezone: { type: String, default: 'UTC' },
  lat: { type: Number },
  lng: { type: Number },
  terminal: { type: [String], default: ['T1'] },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Airport', AirportSchema);
