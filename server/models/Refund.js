const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Requested', 'Approved', 'Rejected', 'Processed'], default: 'Requested' },
  refundMethod: { type: String, enum: ['Wallet', 'Original Payment Method'], default: 'Wallet' },
  adminComment: { type: String, default: '' },
  processedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Refund', refundSchema);
