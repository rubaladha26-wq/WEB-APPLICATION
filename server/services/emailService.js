const sendEmail = require('../utils/sendEmail');
const { generateInvoicePDFBuffer } = require('./pdfService');
const Setting = require('../models/Setting');

/**
 * Sends an invoice PDF to the customer's email
 */
const sendInvoiceEmail = async (invoice) => {
  const customer = invoice.customer;
  if (!customer || !customer.email) {
    throw new Error('Customer email is not available');
  }

  const setting = await Setting.findOne();
  const pdfBuffer = await generateInvoicePDFBuffer(invoice, setting);
  const currency = invoice.currency || setting?.currencySymbol || '$';

  const subject = `Invoice ${invoice.invoiceNumber} from ${setting?.companyName || 'Nexus Billing'}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #334155;">
      <h2 style="color: #2563eb;">Invoice Notification</h2>
      <p>Dear <strong>${customer.name}</strong>,</p>
      <p>Please find attached your invoice <strong>${invoice.invoiceNumber}</strong> dated <strong>${new Date(invoice.issueDate).toLocaleDateString()}</strong>.</p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 4px 0;"><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
        <p style="margin: 4px 0;"><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
        <p style="margin: 4px 0;"><strong>Total Amount:</strong> ${currency} ${invoice.grandTotal.toFixed(2)}</p>
        <p style="margin: 4px 0; color: #dc2626;"><strong>Balance Due:</strong> ${currency} ${invoice.balanceDue.toFixed(2)}</p>
      </div>
      <p>You can review the attached PDF for the full breakdown and remit payment before the due date.</p>
      <p style="margin-top: 24px; font-size: 13px; color: #64748b;">Thank you for your business!<br>${setting?.companyName || 'Nexus Billing Solutions'}</p>
    </div>
  `;

  await sendEmail({
    to: customer.email,
    subject,
    html,
    attachments: [
      {
        filename: `Invoice_${invoice.invoiceNumber}.pdf`,
        content: pdfBuffer,
      },
    ],
  });

  return true;
};

module.exports = { sendInvoiceEmail };

