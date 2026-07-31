const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  paymentMethod: { type: String, enum: ['Card', 'UPI', 'Stripe', 'Razorpay', 'Wallet'], default: 'Card' },
  paymentIntentId: { type: String, default: '' },
  transactionId: { type: String, required: true },
  status: { type: String, enum: ['Completed', 'Pending', 'Failed', 'Refunded'], default: 'Completed' },
  receiptUrl: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
