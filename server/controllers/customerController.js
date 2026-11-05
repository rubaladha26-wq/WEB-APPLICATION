const Customer = require('../models/Customer');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const { logAudit } = require('../utils/logger');

// @desc    Get all customers with search, pagination & filters
// @route   GET /api/customers
// @access  Private
const getCustomers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || '';

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && ['active', 'inactive'].includes(status)) {
      query.status = status;
    }

    const total = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: customers.length,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      currentPage: page,
      data: customers,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single customer profile & billing history
// @route   GET /api/customers/:id
// @access  Private
const getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id).populate('createdBy', 'name email');
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Retrieve invoices for this customer
    const invoices = await Invoice.find({ customer: req.params.id })
      .sort({ issueDate: -1 })
      .limit(20);

    // Retrieve payments for this customer
    const payments = await Payment.find({ customer: req.params.id })
      .sort({ paymentDate: -1 })
      .limit(20);

    // Calculate dynamic totals from invoices
    const allInvoices = await Invoice.find({ customer: req.params.id });
    const totalBilled = allInvoices.reduce((acc, inv) => acc + (inv.grandTotal || 0), 0);
    const totalPaid = allInvoices.reduce((acc, inv) => acc + (inv.totalPaid || 0), 0);
    const balance = Math.max(0, totalBilled - totalPaid);

    // Update customer cached balances if discrepancy
    if (customer.totalBilled !== totalBilled || customer.totalPaid !== totalPaid || customer.balance !== balance) {
      customer.totalBilled = totalBilled;
      customer.totalPaid = totalPaid;
      customer.balance = balance;
      await customer.save();
    }

    res.status(200).json({
      success: true,
      data: {
        customer,
        invoices,
        payments,
        stats: {
          totalInvoices: allInvoices.length,
          totalBilled,
          totalPaid,
          balance,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new customer
// @route   POST /api/customers
// @access  Private
const createCustomer = async (req, res, next) => {
  try {
    const customerData = {
      ...req.body,
      createdBy: req.user.id,
    };

    const customer = await Customer.create(customerData);

    await logAudit({
      req,
      user: req.user,
      action: 'CREATE_CUSTOMER',
      entityType: 'Customer',
      entityId: customer._id,
      description: `Created customer: ${customer.name} (${customer.email})`,
    });

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
const updateCustomer = async (req, res, next) => {
  try {
    let customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    await logAudit({
      req,
      user: req.user,
      action: 'UPDATE_CUSTOMER',
      entityType: 'Customer',
      entityId: customer._id,
      description: `Updated customer: ${customer.name}`,
    });

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: customer,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private (Admin & Accountant)
const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Check if customer has active or unpaid invoices
    const invoiceCount = await Invoice.countDocuments({
      customer: req.params.id,
      balanceDue: { $gt: 0 },
    });

    if (invoiceCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete customer with ${invoiceCount} outstanding unpaid invoices. Please settle or cancel invoices first.`,
      });
    }

    await Customer.findByIdAndDelete(req.params.id);

    await logAudit({
      req,
      user: req.user,
      action: 'DELETE_CUSTOMER',
      entityType: 'Customer',
      entityId: customer._id,
      description: `Deleted customer: ${customer.name} (${customer.email})`,
    });

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};

