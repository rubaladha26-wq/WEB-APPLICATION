const Joi = require('joi');

const invoiceItemSchema = Joi.object({
  product: Joi.string().allow('', null),
  name: Joi.string().required(),
  description: Joi.string().allow('', null),
  quantity: Joi.number().min(0.01).required(),
  unitPrice: Joi.number().min(0).required(),
  taxRate: Joi.number().min(0).default(0),
  discountRate: Joi.number().min(0).default(0),
});

const invoiceSchema = Joi.object({
  invoiceNumber: Joi.string().allow('', null),
  customer: Joi.string().required(),
  issueDate: Joi.date().default(Date.now),
  dueDate: Joi.date().required(),
  status: Joi.string().valid('Draft', 'Sent', 'Pending', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled').default('Draft'),
  items: Joi.array().items(invoiceItemSchema).min(1).required(),
  discountType: Joi.string().valid('percentage', 'fixed').default('percentage'),
  discountValue: Joi.number().min(0).default(0),
  taxType: Joi.string().valid('percentage', 'fixed').default('percentage'),
  taxRate: Joi.number().min(0).default(0),
  shippingCost: Joi.number().min(0).default(0),
  currency: Joi.string().default('USD'),
  notes: Joi.string().allow('', null),
  terms: Joi.string().allow('', null),
  paymentTerms: Joi.string().allow('', null),
  isRecurring: Joi.boolean().default(false),
  recurringFrequency: Joi.string().valid('weekly', 'monthly', 'quarterly', 'yearly').default('monthly'),
});

const paymentSchema = Joi.object({
  invoice: Joi.string().required(),
  amount: Joi.number().min(0.01).required(),
  paymentDate: Joi.date().default(Date.now),
  paymentMethod: Joi.string().valid('Bank Transfer', 'Credit Card', 'Cash', 'PayPal', 'Stripe', 'UPI', 'Cheque', 'Other').required(),
  transactionId: Joi.string().allow('', null),
  notes: Joi.string().allow('', null),
});

const validateInvoice = (req, res, next) => {
  const { error } = invoiceSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const errorMessages = error.details.map((d) => d.message).join('; ');
    return res.status(400).json({ success: false, message: errorMessages });
  }
  next();
};

const validatePayment = (req, res, next) => {
  const { error } = paymentSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const errorMessages = error.details.map((d) => d.message).join('; ');
    return res.status(400).json({ success: false, message: errorMessages });
  }
  next();
};

module.exports = { validateInvoice, validatePayment };

