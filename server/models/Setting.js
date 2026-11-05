const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      default: 'Nexus Billing Solutions Inc.',
      trim: true,
    },
    companyEmail: {
      type: String,
      default: 'billing@nexusbill.com',
      trim: true,
    },
    companyPhone: {
      type: String,
      default: '+1 (555) 234-5678',
      trim: true,
    },
    companyWebsite: {
      type: String,
      default: 'https://nexusbill.example.com',
      trim: true,
    },
    companyAddress: {
      street: { type: String, default: '100 Innovation Way, Suite 400' },
      city: { type: String, default: 'San Francisco' },
      state: { type: String, default: 'CA' },
      postalCode: { type: String, default: '94107' },
      country: { type: String, default: 'United States' },
    },
    taxId: {
      type: String,
      default: 'TAX-US-987654321', // GST/VAT/EIN
      trim: true,
    },
    defaultCurrency: {
      type: String,
      default: 'USD',
      trim: true,
    },
    currencySymbol: {
      type: String,
      default: '$',
      trim: true,
    },
    defaultTaxRate: {
      type: Number,
      default: 10,
    },
    invoicePrefix: {
      type: String,
      default: 'INV',
      trim: true,
    },
    invoiceFooterNotes: {
      type: String,
      default: 'Thank you for choosing Nexus Billing Solutions! Please remit payment within terms.',
    },
    invoiceTermsAndConditions: {
      type: String,
      default: 'Payment terms: Due on Receipt unless otherwise specified. A 1.5% late fee applies to overdue balances past 30 days.',
    },
    logoUrl: {
      type: String,
      default: '',
    },
    enableQR: {
      type: Boolean,
      default: true,
    },
    enableEmailNotifications: {
      type: Boolean,
      default: true,
    },
    enableOverdueAlerts: {
      type: Boolean,
      default: true,
    },
    emailConfig: {
      host: { type: String, default: 'smtp.mailtrap.io' },
      port: { type: Number, default: 2525 },
      user: { type: String, default: '' },
      password: { type: String, default: '' },
      secure: { type: Boolean, default: false },
      fromName: { type: String, default: 'Nexus Billing' },
      fromEmail: { type: String, default: 'no-reply@nexusbill.com' },
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Setting', SettingSchema);

