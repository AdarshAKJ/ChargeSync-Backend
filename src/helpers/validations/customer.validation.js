import Joi from "joi";

export const createCustomerValidation = Joi.object({
  clientId: Joi.string().required(),
  email: Joi.string().email().optional().allow(null),
  password: Joi.string().required(),
  phoneNumber: Joi.string().optional().allow(null),
  countryCode: Joi.string().optional().allow(null),
  loginBy: Joi.string().optional().allow("EMAIL", "PHONE"),
  isDeleted: Joi.boolean().default(false),
});

export const signupOrLoginOTPVerificationValidation = Joi.object({
  email: Joi.string().email().optional().allow(null),
  phoneNumber: Joi.string().optional().allow(null),
  countryCode: Joi.string().optional().allow(null),
  otp: Joi.string().required(),
});

export const updateCustomerValidation = Joi.object({
  id: Joi.string().required(),
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
export const listCustomerValidation = Joi.object({
  clientId: Joi.string().required(),
});
export const singleCustomerValidation = Joi.object({
  id: Joi.string().required(),
  clientId: Joi.string().required(),
});
