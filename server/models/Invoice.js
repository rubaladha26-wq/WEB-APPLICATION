const mongoose = require('mongoose');

const InvoiceItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, 'Unit price cannot be negative'],
      default: 0,
    },
    taxRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    discountRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: true }
);

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: [true, 'Please provide an invoice number'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    status: {
      type: String,
      enum: ['Draft', 'Sent', 'Pending', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'],
      default: 'Draft',
    },
    items: {
      type: [InvoiceItemSchema],
      validate: [
        (val) => val.length > 0,
        'Invoice must have at least one line item',
      ],
    },
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
    },
    discountValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
    },
    taxRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      default: 0,
    },
    totalPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    balanceDue: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true,
      uppercase: true,
    },
    notes: {
      type: String,
      default: 'Thank you for your business!',
    },
    terms: {
      type: String,
      default: 'Payment is due within the stipulated due date. Late payments may be subject to a fee.',
    },
    paymentTerms: {
      type: String,
      default: 'Due on Receipt', // 'Due on Receipt', 'Net 15', 'Net 30', 'Net 60'
    },
    qrCodeDataUrl: {
      type: String,
      default: '',
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringFrequency: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
      default: 'monthly',
    },
    nextRecurringDate: {
      type: Date,
      default: null,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

InvoiceSchema.index({ invoiceNumber: 1, customer: 1, status: 1, issueDate: -1 });

// Helper function to re-calculate automatic totals before save
InvoiceSchema.pre('validate', function (next) {
  let subtotal = 0;
  let totalItemTax = 0;

  if (this.items && this.items.length > 0) {
    this.items.forEach((item) => {
      const itemSubtotal = (item.quantity || 1) * (item.unitPrice || 0);
      const itemDisc = item.discountRate ? (itemSubtotal * item.discountRate) / 100 : 0;
      item.discountAmount = itemDisc;
      const taxable = itemSubtotal - itemDisc;
      const itemTax = item.taxRate ? (taxable * item.taxRate) / 100 : 0;
      item.taxAmount = itemTax;
      item.total = taxable + itemTax;

      subtotal += itemSubtotal;
      totalItemTax += itemTax;
    });
  }

  this.subtotal = Math.round(subtotal * 100) / 100;

  // Calculate invoice level discount
  let discountAmt = 0;
  if (this.discountType === 'percentage') {
    discountAmt = (this.subtotal * (this.discountValue || 0)) / 100;
  } else {
    discountAmt = this.discountValue || 0;
  }
  this.discountAmount = Math.round(discountAmt * 100) / 100;

  const afterDiscount = Math.max(0, this.subtotal - this.discountAmount);

  // Overall tax if applied at invoice level or sum of items
  let overallTax = 0;
  if (this.taxRate > 0) {
    overallTax = (afterDiscount * this.taxRate) / 100;
    this.taxAmount = Math.round(overallTax * 100) / 100;
  } else {
    this.taxAmount = Math.round(totalItemTax * 100) / 100;
  }

  const shipping = Number(this.shippingCost) || 0;
  this.grandTotal = Math.round((afterDiscount + this.taxAmount + shipping) * 100) / 100;

  const paid = Number(this.totalPaid) || 0;
  this.balanceDue = Math.max(0, Math.round((this.grandTotal - paid) * 100) / 100);

  // Auto update status based on balance
  if (this.balanceDue === 0 && this.grandTotal > 0) {
    this.status = 'Paid';
    if (!this.paidAt) this.paidAt = new Date();
  } else if (paid > 0 && this.balanceDue > 0) {
    this.status = 'Partially Paid';
  } else if (this.status !== 'Draft' && this.dueDate && new Date(this.dueDate) < new Date() && this.balanceDue > 0) {
    this.status = 'Overdue';
  }

  next();
});

module.exports = mongoose.model('Invoice', InvoiceSchema);

