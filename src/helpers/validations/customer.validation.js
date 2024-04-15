import Joi from "joi";

export const createCustomerValidation = Joi.object({
  email: Joi.string().email().optional().allow(null),
  password: Joi.string(),
  phoneNumber: Joi.string().optional().allow(null),
  countryCode: Joi.string().optional().allow(null),
  loginBy: Joi.string().optional().allow("EMAIL", "PHONE"),
});

export const v2CreateCustomerValidation = Joi.object({
  email: Joi.string().email().optional().allow(null),
  phoneNumber: Joi.string().optional().allow(null),
  countryCode: Joi.string().optional().allow(null),
  loginBy: Joi.string().optional().allow("EMAIL", "PHONE"),
});

export const createPinValidation = Joi.object({
  clientId: Joi.string().optional(),
  id: Joi.string().required(),
  pin: Joi.string().required(),
  checkPin: Joi.string().required(),
});

export const signupOrLoginOTPVerificationValidation = Joi.object({
  id: Joi.string().required(),
  otp: Joi.string().required(),
  password: Joi.number().integer().min(100000).max(999999).required(),
  confirmPassword: Joi.number().integer().min(100000).max(999999).required(),
  termAndCondition: Joi.boolean().valid(true).required(),
});

export const updateCustomerValidation = Joi.object({
  id: Joi.string().required(),
  fname: Joi.string().required(),
  lname: Joi.string().required(),
  address: Joi.object().optional().allow(null),
  dob: Joi.string().optional().allow(null, ""),
  // termAndCondition: Joi.boolean().valid(true).required(),
});

// export const listCustomerValidation = Joi.object({
//   clientId: Joi.string().required(),
// });

export const singleCustomerValidation = Joi.object({
  id: Joi.string().required(),
  // clientId: Joi.string().required(),
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

// export const getCustomerSelectValidation = Joi.object({
//   clientId: Joi.string().optional().allow(null),
// });
export const getChargerSelectValidation = Joi.object({
  clientId: Joi.string().optional().allow(null),
});
export const getStationSelectValidation = Joi.object({
  clientId: Joi.string().optional().allow(null),
});

export const forgotPasswordValidation = Joi.object({
  email: Joi.string().email().optional().allow(null, ""),
  phoneNumber: Joi.string().optional().allow(null, ""),
  type: Joi.string().required().allow("EMAIL", "PHONE"),
});

export const resetPasswordValidation = Joi.object({
  _id: Joi.string().required(),
  otp: Joi.string().required(),
  new_password: Joi.string().min(6).required(),
  compare_password: Joi.string()
    .valid(Joi.ref("new_password"))
    .required()
    .strict(),
});
export const chargerAvailableConnectorsValidation = Joi.object({
  serialNumber: Joi.string().required(),
  clientId: Joi.string().optional().allow(null),
});

export const loginValidation = Joi.object({
  id: Joi.string().required(),
  password: Joi.number().integer().min(100000).max(999999).required(),
});

export const chargerClientIdValidation = Joi.object({
  serialNumber: Joi.string().required(),
});
export const chargerOfflineOnlineValidation = Joi.object({
  serialNumber: Joi.string().required(),
});
