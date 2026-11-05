const Joi = require('joi');

const customerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().email().required(),
  phone: Joi.string().allow('', null),
  companyName: Joi.string().allow('', null),
  gstNumber: Joi.string().allow('', null),
  billingAddress: Joi.object({
    street: Joi.string().allow('', null),
    city: Joi.string().allow('', null),
    state: Joi.string().allow('', null),
    postalCode: Joi.string().allow('', null),
    country: Joi.string().allow('', null),
  }).optional(),
  shippingAddress: Joi.object({
    street: Joi.string().allow('', null),
    city: Joi.string().allow('', null),
    state: Joi.string().allow('', null),
    postalCode: Joi.string().allow('', null),
    country: Joi.string().allow('', null),
  }).optional(),
  currency: Joi.string().default('USD'),
  notes: Joi.string().allow('', null),
  status: Joi.string().valid('active', 'inactive').default('active'),
});

const validateCustomer = (req, res, next) => {
  const { error } = customerSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const errorMessages = error.details.map((d) => d.message).join('; ');
    return res.status(400).json({ success: false, message: errorMessages });
  }
  next();
};

module.exports = { validateCustomer };

