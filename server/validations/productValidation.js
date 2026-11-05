const Joi = require('joi');

const productSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  sku: Joi.string().trim().allow('', null),
  description: Joi.string().allow('', null),
  category: Joi.string().allow('', null),
  price: Joi.number().min(0).required(),
  costPrice: Joi.number().min(0).default(0),
  taxRate: Joi.number().min(0).default(0),
  stockQuantity: Joi.number().default(0),
  lowStockThreshold: Joi.number().default(5),
  unit: Joi.string().default('unit'),
  isService: Joi.boolean().default(false),
  status: Joi.string().valid('active', 'inactive', 'archived').default('active'),
});

const validateProduct = (req, res, next) => {
  const { error } = productSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const errorMessages = error.details.map((d) => d.message).join('; ');
    return res.status(400).json({ success: false, message: errorMessages });
  }
  next();
};

module.exports = { validateProduct };

