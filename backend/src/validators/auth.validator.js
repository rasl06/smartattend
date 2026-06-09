const Joi = require('joi');

const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.details.map((d) => d.message),
    });
  }
  req.body = value;
  next();
};

module.exports = { validateLogin: validate(loginSchema) };
