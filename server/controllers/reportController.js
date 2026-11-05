const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');
const Product = require('../models/Product');

// @desc    Get dashboard metrics & charts
// @route   GET /api/reports/dashboard
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    // Basic counts
    const totalCustomers = await Customer.countDocuments({ status: 'active' });
    const totalInvoices = await Invoice.countDocuments();

    // Invoices by status aggregation
    const statusCounts = await Invoice.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$grandTotal' },
          totalBalance: { $sum: '$balanceDue' },
        },
      },
    ]);

    const statsByStatus = {
      Paid: { count: 0, amount: 0 },
      Pending: { count: 0, amount: 0 },
      'Partially Paid': { count: 0, amount: 0 },
      Overdue: { count: 0, amount: 0 },
      Draft: { count: 0, amount: 0 },
      Sent: { count: 0, amount: 0 },
    };

    statusCounts.forEach((st) => {
      if (statsByStatus[st._id] !== undefined) {
        statsByStatus[st._id] = {
          count: st.count,
          amount: Math.round(st.totalAmount * 100) / 100,
          balance: Math.round(st.totalBalance * 100) / 100,
        };
      }
    });

    // Total revenue from all recorded completed payments
    const paymentsTotal = await Payment.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = paymentsTotal.length > 0 ? Math.round(paymentsTotal[0].total * 100) / 100 : 0;

    // Monthly revenue aggregation for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyPayments = await Payment.aggregate([
      {
        $match: {
          status: 'Completed',
          paymentDate: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$paymentDate' },
            month: { $month: '$paymentDate' },
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Format monthly data for chart display
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyAnalytics = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const y = d.getFullYear();
      const m = d.getMonth() + 1; // 1-12
      const label = `${monthNames[m - 1]} ${y}`;

      const found = monthlyPayments.find(
        (p) => p._id.year === y && p._id.month === m
      );

      monthlyAnalytics.push({
        month: label,
        revenue: found ? Math.round(found.revenue * 100) / 100 : 0,
        transactions: found ? found.count : 0,
      });
    }

    // Recent 5 transactions/payments
    const recentTransactions = await Payment.find({ status: 'Completed' })
      .populate('customer', 'name email companyName')
      .populate('invoice', 'invoiceNumber')
      .sort({ paymentDate: -1 })
      .limit(6);

    // Recent 5 invoices
    const recentInvoices = await Invoice.find()
      .populate('customer', 'name email companyName')
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalCustomers,
        totalInvoices,
        statsByStatus,
        monthlyAnalytics,
        recentTransactions,
        recentInvoices,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get detailed reports & analytics
// @route   GET /api/reports/analytics
// @access  Private
const getReportsAnalytics = async (req, res, next) => {
  try {
    // Customer spending analysis (Top 10 customers)
    const customerSpending = await Invoice.aggregate([
      {
        $group: {
          _id: '$customer',
          totalBilled: { $sum: '$grandTotal' },
          totalPaid: { $sum: '$totalPaid' },
          totalBalance: { $sum: '$balanceDue' },
          invoiceCount: { $sum: 1 },
        },
      },
      { $sort: { totalBilled: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customerDetails',
        },
      },
      { $unwind: '$customerDetails' },
      {
        $project: {
          _id: 1,
          customerName: '$customerDetails.name',
          customerEmail: '$customerDetails.email',
          companyName: '$customerDetails.companyName',
          totalBilled: { $round: ['$totalBilled', 2] },
          totalPaid: { $round: ['$totalPaid', 2] },
          totalBalance: { $round: ['$totalBalance', 2] },
          invoiceCount: 1,
        },
      },
    ]);

    // Product sales performance
    const productSales = await Invoice.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          unitsSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 8 },
    ]);

    // Payment method breakdown
    const paymentMethods = await Payment.aggregate([
      { $match: { status: 'Completed' } },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        customerSpending,
        productSales,
        paymentMethods,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getReportsAnalytics,
};

