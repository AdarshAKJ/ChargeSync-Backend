import Joi from "joi";

export const customerValidation = Joi.object({
  clientId: Joi.string().required(),
  fname: Joi.string().required(),
  lname: Joi.string().required(),
  email: Joi.string().email().optional().allow(null),
  phoneNumber: Joi.string().optional().allow(null),
  address: Joi.object().optional().allow(null),
  dob: Joi.string().optional().allow(null),
  countryCode: Joi.string().optional().allow(null),
  created_by: Joi.string(),
  updated_by: Joi.string(),
  created_at: Joi.string(),
  updated_at: Joi.string(),
  isDeleted: Joi.boolean().default(false),
});
