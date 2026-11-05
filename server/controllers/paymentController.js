const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const Notification = require('../models/Notification');
const { logAudit } = require('../utils/logger');

// Generate unique receipt number
const generateReceiptNumber = async () => {
  const year = new Date().getFullYear();
  const count = await Payment.countDocuments();
  return `REC-${year}-${String(count + 1).padStart(5, '0')}`;
};

// @desc    Record a payment for an invoice
// @route   POST /api/payments
// @access  Private (Admin & Accountant)
const recordPayment = async (req, res, next) => {
  try {
    const { invoice: invoiceId, amount, paymentDate, paymentMethod, transactionId, notes } = req.body;

    const invoice = await Invoice.findById(invoiceId).populate('customer');
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (invoice.balanceDue <= 0) {
      return res.status(400).json({ success: false, message: 'This invoice has already been fully paid.' });
    }

    const payAmount = Number(amount);
    if (payAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Payment amount must be greater than zero.' });
    }

    if (payAmount > invoice.balanceDue) {
      return res.status(400).json({
        success: false,
        message: `Payment amount (${payAmount}) cannot exceed outstanding balance (${invoice.balanceDue}).`,
      });
    }

    const receiptNumber = await generateReceiptNumber();

    const payment = await Payment.create({
      invoice: invoice._id,
      customer: invoice.customer._id,
      amount: payAmount,
      paymentDate: paymentDate || new Date(),
      paymentMethod,
      transactionId: transactionId || '',
      receiptNumber,
      notes: notes || '',
      recordedBy: req.user.id,
      status: 'Completed',
    });

    // Update invoice totals and status
    invoice.totalPaid = Math.round(((invoice.totalPaid || 0) + payAmount) * 100) / 100;
    invoice.balanceDue = Math.max(0, Math.round((invoice.grandTotal - invoice.totalPaid) * 100) / 100);

    if (invoice.balanceDue === 0) {
      invoice.status = 'Paid';
      invoice.paidAt = new Date();
    } else {
      invoice.status = 'Partially Paid';
    }
    await invoice.save();

    // Update customer balances
    const customer = await Customer.findById(invoice.customer._id);
    if (customer) {
      customer.totalPaid = Math.round(((customer.totalPaid || 0) + payAmount) * 100) / 100;
      customer.balance = Math.max(0, Math.round(((customer.balance || 0) - payAmount) * 100) / 100);
      await customer.save();
    }

    // Create notification
    await Notification.create({
      user: null,
      title: 'Payment Received',
      message: `Payment of ${invoice.currency} ${payAmount.toFixed(2)} received for Invoice ${invoice.invoiceNumber} (${paymentMethod}).`,
      type: 'payment_received',
      referenceId: payment._id.toString(),
      referenceModel: 'Payment',
    });

    await logAudit({
      req,
      user: req.user,
      action: 'RECORD_PAYMENT',
      entityType: 'Payment',
      entityId: payment._id,
      description: `Payment recorded: ${invoice.currency} ${payAmount} for ${invoice.invoiceNumber} (Receipt: ${receiptNumber})`,
    });

    const populatedPayment = await Payment.findById(payment._id)
      .populate('invoice', 'invoiceNumber grandTotal balanceDue status')
      .populate('customer', 'name email companyName')
      .populate('recordedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: populatedPayment,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
const getPayments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { customer, invoice, paymentMethod, startDate, endDate } = req.query;
    const query = {};

    if (customer) query.customer = customer;
    if (invoice) query.invoice = invoice;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.paymentDate.$lte = end;
      }
    }

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate('invoice', 'invoiceNumber grandTotal balanceDue status currency')
      .populate('customer', 'name email companyName')
      .populate('recordedBy', 'name email')
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      currentPage: page,
      data: payments,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single payment receipt
// @route   GET /api/payments/:id
// @access  Private
const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('invoice')
      .populate('customer')
      .populate('recordedBy', 'name email');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment receipt not found' });
    }

    res.status(200).json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  recordPayment,
  getPayments,
  getPaymentById,
};

