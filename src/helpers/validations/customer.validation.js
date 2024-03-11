import Joi from "joi";

export const createCustomerValidation = Joi.object({
  clientId: Joi.string().required(),
  email: Joi.string().email().optional().allow(null),
  password: Joi.string(),
  phoneNumber: Joi.string().optional().allow(null),
  countryCode: Joi.string().optional().allow(null),
  loginBy: Joi.string().optional().allow("EMAIL", "PHONE"),
});

export const v2CreateCustomerValidation = Joi.object({
  clientId: Joi.string().required(),
  email: Joi.string().email().optional().allow(null),
  password: Joi.string(),
  phoneNumber: Joi.string().optional().allow(null),
  countryCode: Joi.string().optional().allow(null),
  loginBy: Joi.string().optional().allow("EMAIL", "PHONE"),
});

export const createPinValidation = Joi.object({
  clientId: Joi.string().required(),
  id: Joi.string().required(),
  pin: Joi.string().required(),
  checkPin: Joi.string().required(),
});

export const signupOrLoginOTPVerificationValidation = Joi.object({
  clientId: Joi.string().required(),
  email: Joi.string().email().optional().allow(null),
  phoneNumber: Joi.string().optional().allow(null),
  countryCode: Joi.string().optional().allow(null),
  otp: Joi.string().required(),
});

export const updateCustomerValidation = Joi.object({
  id: Joi.string().required(),
  fname: Joi.string().required(),
  lname: Joi.string().required(),
  address: Joi.object().optional().allow(null),
  dob: Joi.string().optional().allow(null),
});

export const listCustomerValidation = Joi.object({
  clientId: Joi.string().required(),
});

export const singleCustomerValidation = Joi.object({
  id: Joi.string().required(),
  clientId: Joi.string().required(),
});

export const startTransactionValidation = Joi.object({
  serialNumber: Joi.string().required(),
  connectorId: Joi.string().required(),
  vehicleId: Joi.string().required(),
  requestedWatts: Joi.number().integer().min(1000).optional(), // In Watt only
  // requiredTime: Joi.number().integer().optional().allow(null),
});

export const stopTransactionValidation = Joi.object({
  serialNumber: Joi.string().required(),
  transactionId: Joi.string().required(),
  customerReason: Joi.string().required(),
});

export const getCustomerSelectValidation = Joi.object({
  clientId: Joi.string().optional().allow(null),
});
export const getChargerSelectValidation = Joi.object({
  clientId: Joi.string().optional().allow(null),
});
export const getStationSelectValidation = Joi.object({
  clientId: Joi.string().optional().allow(null),
});
export const chargerAvailableConnectorsValidation = Joi.object({  
  serialNumber: Joi.string().required(),
  clientId: Joi.string().optional().allow(null),
});

