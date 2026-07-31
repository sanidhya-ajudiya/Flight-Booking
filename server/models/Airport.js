const mongoose = require('mongoose');

const airportSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  terminal: { type: String, default: 'T1' },
  latitude: { type: Number, default: 0 },
  longitude: { type: Number, default: 0 },
  image: { type: String, default: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80' }
}, { timestamps: true });

module.exports = mongoose.model('Airport', airportSchema);
