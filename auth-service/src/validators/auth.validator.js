const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),

  password: Joi.string()
    .min(8)
    .max(128)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'any.required': 'Password is required',
    }),

  fullName: Joi.string()
    .min(2)
    .max(255)
    .required()
    .messages({
      'string.empty': 'Full name is required',
      'string.min': 'Full name must contain at least 2 characters',
      'string.max': 'Full name cannot exceed 255 characters',
      'any.required': 'Full name is required',
    })

}).options({
  abortEarly: false,
  allowUnknown: false
}).messages({
  'object.unknown': '{{#label}} is not allowed'
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Invalid email format',
      'any.required': 'Email is required',
    }),

  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required',
    })

}).options({
  abortEarly: false,
  allowUnknown: false
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'string.empty': 'Refresh token is required',
      'any.required': 'Refresh token is required',
    })

}).options({
  abortEarly: false,
  allowUnknown: false
});

module.exports = { registerSchema, loginSchema, refreshSchema };
