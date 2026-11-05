const Invoice = require('../models/Invoice');
const Notification = require('../models/Notification');
const generateInvoiceNumber = require('../utils/generateInvoiceNumber');
const { generateQRCode } = require('./qrService');

/**
 * Calculates next date based on frequency
 */
const calculateNextDate = (currentDate, frequency) => {
  const next = new Date(currentDate);
  switch (frequency) {
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'quarterly':
      next.setMonth(next.getMonth() + 3);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
    case 'monthly':
    default:
      next.setMonth(next.getMonth() + 1);
      break;
  }
  return next;
};

/**
 * Checks and creates recurring invoices
 */
const processRecurringInvoices = async () => {
  try {
    const today = new Date();
    const recurringInvoices = await Invoice.find({
      isRecurring: true,
      nextRecurringDate: { $lte: today },
    }).populate('customer');

    const createdInvoices = [];

    for (const baseInvoice of recurringInvoices) {
      const newInvoiceNumber = await generateInvoiceNumber();
      const newIssueDate = new Date();
      const newDueDate = new Date();
      newDueDate.setDate(newDueDate.getDate() + 15); // default 15 days due

      const qrCode = await generateQRCode(
        JSON.stringify({
          invoiceNumber: newInvoiceNumber,
          customer: baseInvoice.customer?.name,
          amount: baseInvoice.grandTotal,
        })
      );

      const newInvoice = new Invoice({
        invoiceNumber: newInvoiceNumber,
        customer: baseInvoice.customer?._id,
        user: baseInvoice.user,
        issueDate: newIssueDate,
        dueDate: newDueDate,
        status: 'Sent',
        items: baseInvoice.items.map((it) => ({
          product: it.product,
          name: it.name,
          description: it.description,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          taxRate: it.taxRate,
          discountRate: it.discountRate,
        })),
        discountType: baseInvoice.discountType,
        discountValue: baseInvoice.discountValue,
        taxType: baseInvoice.taxType,
        taxRate: baseInvoice.taxRate,
        shippingCost: baseInvoice.shippingCost,
        currency: baseInvoice.currency,
        notes: baseInvoice.notes,
        terms: baseInvoice.terms,
        paymentTerms: baseInvoice.paymentTerms,
        qrCodeDataUrl: qrCode,
        isRecurring: false, // Child generated instance is not itself recurring
      });

      await newInvoice.save();

      // Update parent's next recurring date
      baseInvoice.nextRecurringDate = calculateNextDate(
        baseInvoice.nextRecurringDate || today,
        baseInvoice.recurringFrequency
      );
      await baseInvoice.save();

      createdInvoices.push(newInvoice);

      // Create notification
      await Notification.create({
        user: baseInvoice.user,
        title: 'Recurring Invoice Generated',
        message: `Recurring invoice ${newInvoice.invoiceNumber} was automatically created for ${baseInvoice.customer?.name || 'Customer'}.`,
        type: 'invoice_created',
        referenceId: newInvoice._id.toString(),
        referenceModel: 'Invoice',
      });
    }

    return createdInvoices;
  } catch (err) {
    console.error('[RecurringService] Error processing recurring invoices:', err.message);
    return [];
  }
};

module.exports = { processRecurringInvoices };

