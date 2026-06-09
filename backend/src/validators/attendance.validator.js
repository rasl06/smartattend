const Joi = require('joi');

const scanSchema = Joi.object({
  token:             Joi.string().required(),
  classId:           Joi.string().uuid().required(),
  latitude:          Joi.number().min(-90).max(90).optional(),
  longitude:         Joi.number().min(-180).max(180).optional(),
  deviceFingerprint: Joi.string().max(255).optional(),
});

const validate = (schema) => (data) => schema.validate(data, { abortEarly: false });

module.exports = { validateScan: validate(scanSchema) };
