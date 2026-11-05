const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const Setting = require('../models/Setting');
const generateInvoiceNumber = require('../utils/generateInvoiceNumber');
const { generateQRCode } = require('../services/qrService');
const { generateInvoicePDFBuffer } = require('../services/pdfService');
const { sendInvoiceEmail } = require('../services/emailService');
const { processRecurringInvoices } = require('../services/recurringInvoiceService');
const { logAudit } = require('../utils/logger');

// @desc    Get all invoices with advanced search & filter
// @route   GET /api/invoices
// @access  Private
const getInvoices = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const {
      search,
      customer,
      status,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    // Search by invoice number or notes
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    if (customer) {
      query.customer = customer;
    }

    if (status) {
      query.status = status;
    }

    // Date range filter
    if (startDate || endDate) {
      query.issueDate = {};
      if (startDate) query.issueDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.issueDate.$lte = end;
      }
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      query.grandTotal = {};
      if (minAmount) query.grandTotal.$gte = Number(minAmount);
      if (maxAmount) query.grandTotal.$lte = Number(maxAmount);
    }

    // Dynamic auto-update overdue status on fetch
    await Invoice.updateMany(
      {
        status: { $in: ['Sent', 'Pending', 'Partially Paid'] },
        dueDate: { $lt: new Date() },
        balanceDue: { $gt: 0 },
      },
      { status: 'Overdue' }
    );

    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const total = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
      .populate('customer', 'name email companyName phone')
      .populate('user', 'name email')
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: invoices.length,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      currentPage: page,
      data: invoices,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single invoice by ID
// @route   GET /api/invoices/:id
// @access  Private
const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer')
      .populate('user', 'name email role');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    // Fetch payments for this invoice
    const payments = await Payment.find({ invoice: invoice._id })
      .populate('recordedBy', 'name email')
      .sort({ paymentDate: -1 });

    res.status(200).json({
      success: true,
      data: {
        invoice,
        payments,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Private
const createInvoice = async (req, res, next) => {
  try {
    let { invoiceNumber } = req.body;

    if (!invoiceNumber || invoiceNumber.trim() === '') {
      invoiceNumber = await generateInvoiceNumber();
    } else {
      const existing = await Invoice.findOne({ invoiceNumber });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Invoice number '${invoiceNumber}' already exists.`,
        });
      }
    }

    // Fetch customer to ensure validity
    const customer = await Customer.findById(req.body.customer);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Specified customer does not exist' });
    }

    // Generate QR code for invoice
    const qrData = JSON.stringify({
      invoiceNumber,
      customer: customer.name,
      amount: req.body.grandTotal || 0,
      dueDate: req.body.dueDate,
    });
    const qrCodeDataUrl = await generateQRCode(qrData);

    const invoiceData = {
      ...req.body,
      invoiceNumber,
      qrCodeDataUrl,
      user: req.user.id,
    };

    const invoice = new Invoice(invoiceData);
    await invoice.save();

    // Deduct stock for inventory products
    if (invoice.items && invoice.items.length > 0) {
      for (const item of invoice.items) {
        if (item.product) {
          const product = await Product.findById(item.product);
          if (product && !product.isService) {
            product.stockQuantity = Math.max(0, product.stockQuantity - item.quantity);
            await product.save();
          }
        }
      }
    }

    // Update customer billing totals
    customer.totalBilled = (customer.totalBilled || 0) + invoice.grandTotal;
    customer.balance = (customer.balance || 0) + invoice.balanceDue;
    await customer.save();

    // Create system notification
    await Notification.create({
      user: null,
      title: 'New Invoice Created',
      message: `Invoice ${invoice.invoiceNumber} for ${customer.name} (${invoice.currency} ${invoice.grandTotal.toFixed(2)}) has been generated.`,
      type: 'invoice_created',
      referenceId: invoice._id.toString(),
      referenceModel: 'Invoice',
    });

    await logAudit({
      req,
      user: req.user,
      action: 'CREATE_INVOICE',
      entityType: 'Invoice',
      entityId: invoice._id,
      description: `Created invoice ${invoice.invoiceNumber} for ${customer.name} - Total: ${invoice.grandTotal}`,
    });

    const populatedInvoice = await Invoice.findById(invoice._id).populate('customer user');

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: populatedInvoice,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private
const updateInvoice = async (req, res, next) => {
  try {
    let invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    // Prevent changing fully paid invoice unless admin
    if (invoice.status === 'Paid' && req.user.role === 'Staff') {
      return res.status(403).json({
        success: false,
        message: 'Staff members cannot modify paid invoices. Request Admin or Accountant.',
      });
    }

    const previousGrandTotal = invoice.grandTotal;
    const previousBalanceDue = invoice.balanceDue;

    Object.assign(invoice, req.body);
    await invoice.save(); // pre('validate') will recalculate subtotal, taxes, grandTotal, and balance

    // Sync customer balance adjustments if grand total changed
    const diffBalance = invoice.balanceDue - previousBalanceDue;
    const diffBilled = invoice.grandTotal - previousGrandTotal;

    if (diffBalance !== 0 || diffBilled !== 0) {
      const customer = await Customer.findById(invoice.customer);
      if (customer) {
        customer.totalBilled = Math.max(0, (customer.totalBilled || 0) + diffBilled);
        customer.balance = Math.max(0, (customer.balance || 0) + diffBalance);
        await customer.save();
      }
    }

    await logAudit({
      req,
      user: req.user,
      action: 'UPDATE_INVOICE',
      entityType: 'Invoice',
      entityId: invoice._id,
      description: `Updated invoice ${invoice.invoiceNumber}`,
    });

    const updated = await Invoice.findById(invoice._id).populate('customer user');

    res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private (Admin & Accountant)
const deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    // Check if payments are attached
    const paymentsCount = await Payment.countDocuments({ invoice: invoice._id });
    if (paymentsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete invoice with recorded payments (${paymentsCount} payments exist). Delete or refund payments first.`,
      });
    }

    // Adjust customer balance
    const customer = await Customer.findById(invoice.customer);
    if (customer) {
      customer.totalBilled = Math.max(0, (customer.totalBilled || 0) - invoice.grandTotal);
      customer.balance = Math.max(0, (customer.balance || 0) - invoice.balanceDue);
      await customer.save();
    }

    await Invoice.findByIdAndDelete(req.params.id);

    await logAudit({
      req,
      user: req.user,
      action: 'DELETE_INVOICE',
      entityType: 'Invoice',
      entityId: invoice._id,
      description: `Deleted invoice ${invoice.invoiceNumber}`,
    });

    res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Download invoice PDF
// @route   GET /api/invoices/:id/pdf
// @access  Private
const getInvoicePDF = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('customer');
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const setting = await Setting.findOne();
    const pdfBuffer = await generateInvoicePDFBuffer(invoice, setting);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=Invoice_${invoice.invoiceNumber}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

// @desc    Send invoice directly to customer email
// @route   POST /api/invoices/:id/send
// @access  Private
const emailInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('customer');
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    await sendInvoiceEmail(invoice);

    invoice.sentAt = new Date();
    if (invoice.status === 'Draft') {
      invoice.status = 'Sent';
    }
    await invoice.save();

    await Notification.create({
      user: req.user.id,
      title: 'Invoice Sent',
      message: `Invoice ${invoice.invoiceNumber} was successfully emailed to ${invoice.customer?.email}.`,
      type: 'invoice_sent',
      referenceId: invoice._id.toString(),
      referenceModel: 'Invoice',
    });

    await logAudit({
      req,
      user: req.user,
      action: 'EMAIL_INVOICE',
      entityType: 'Invoice',
      entityId: invoice._id,
      description: `Emailed invoice ${invoice.invoiceNumber} to ${invoice.customer?.email}`,
    });

    res.status(200).json({
      success: true,
      message: `Invoice sent successfully to ${invoice.customer?.email}`,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Trigger recurring invoices processing
// @route   POST /api/invoices/process-recurring
// @access  Private (Admin & Accountant)
const triggerRecurring = async (req, res, next) => {
  try {
    const generated = await processRecurringInvoices();
    res.status(200).json({
      success: true,
      message: `Processed recurring invoices: ${generated.length} generated.`,
      count: generated.length,
      data: generated,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getInvoicePDF,
  emailInvoice,
  triggerRecurring,
};

