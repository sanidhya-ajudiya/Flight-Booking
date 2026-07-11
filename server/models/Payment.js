const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true, index: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  method: { type: String, enum: ['card', 'upi', 'netbanking', 'wallet'], default: 'card' },
  status: { type: String, enum: ['success', 'failed', 'pending'], default: 'success' },
  refundStatus: { type: String, enum: ['none', 'pending', 'refunded'], default: 'none' },
  paidAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', PaymentSchema);
