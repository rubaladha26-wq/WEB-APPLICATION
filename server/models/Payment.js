const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      required: [true, 'Invoice reference is required'],
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer reference is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0.01, 'Payment amount must be greater than zero'],
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ['Bank Transfer', 'Credit Card', 'Cash', 'PayPal', 'Stripe', 'UPI', 'Cheque', 'Other'],
      default: 'Bank Transfer',
    },
    transactionId: {
      type: String,
      trim: true,
      default: '',
    },
    receiptNumber: {
      type: String,
      unique: true,
      trim: true,
    },
    notes: {
      type: String,
      default: '',
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['Completed', 'Pending', 'Failed'],
      default: 'Completed',
    },
  },
  {
    timestamps: true,
  }
);

PaymentSchema.index({ invoice: 1, customer: 1, paymentDate: -1 });

module.exports = mongoose.model('Payment', PaymentSchema);

