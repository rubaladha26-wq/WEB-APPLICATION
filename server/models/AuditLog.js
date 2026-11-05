const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    entityType: {
      type: String,
      required: true,
      enum: ['Invoice', 'Customer', 'Product', 'Category', 'Payment', 'User', 'Settings', 'Auth'],
    },
    entityId: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

AuditLogSchema.index({ createdAt: -1, user: 1, entityType: 1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);

