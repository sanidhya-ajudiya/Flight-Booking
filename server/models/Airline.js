const mongoose = require('mongoose');

const AirlineSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, index: true },
  name: { type: String, required: true },
  logo: { type: String, default: '' },
  country: { type: String },
  color: { type: String, default: '#1565C0' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Airline', AirlineSchema);
