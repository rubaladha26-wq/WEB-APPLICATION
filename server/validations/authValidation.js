const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(60).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('Admin', 'Accountant', 'Staff').default('Admin'),
  phone: Joi.string().allow('', null),
  company: Joi.object({
    name: Joi.string().allow('', null),
    address: Joi.string().allow('', null),
    phone: Joi.string().allow('', null),
    email: Joi.string().allow('', null),
    taxId: Joi.string().allow('', null),
    logo: Joi.string().allow('', null),
  }).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().email().required(),
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().min(6).required(),
});

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const errorMessages = error.details.map((detail) => detail.message).join('; ');
    return res.status(400).json({
      success: false,
      message: errorMessages,
    });
  }
  next();
};

module.exports = {
  validateRegister: validate(registerSchema),
  validateLogin: validate(loginSchema),
  validateForgotPassword: validate(forgotPasswordSchema),
  validateResetPassword: validate(resetPasswordSchema),
};

