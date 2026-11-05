const Invoice = require('../models/Invoice');
const Setting = require('../models/Setting');

/**
 * Generates the next sequential invoice number
 * Format: {PREFIX}-{YEAR}-{SEQUENCE} (e.g. INV-2026-0001)
 */
const generateInvoiceNumber = async () => {
  const settings = await Setting.findOne();
  const prefix = settings?.invoicePrefix || 'INV';
  const currentYear = new Date().getFullYear();

  // Find the highest sequence for the current year
  const prefixPattern = new RegExp(`^${prefix}-${currentYear}-(\\d+)`);
  const invoices = await Invoice.find({ invoiceNumber: prefixPattern })
    .sort({ invoiceNumber: -1 })
    .limit(1)
    .lean();

  let nextSequence = 1;

  if (invoices.length > 0) {
    const match = invoices[0].invoiceNumber.match(prefixPattern);
    if (match && match[1]) {
      nextSequence = parseInt(match[1], 10) + 1;
    }
  }

  const paddedSequence = String(nextSequence).padStart(4, '0');
  return `${prefix}-${currentYear}-${paddedSequence}`;
};

module.exports = generateInvoiceNumber;

