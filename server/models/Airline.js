const mongoose = require('mongoose');

const airlineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, uppercase: true, unique: true },
  logo: { type: String, required: true },
  country: { type: String, required: true },
  description: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  website: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Airline', airlineSchema);
