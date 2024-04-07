import Joi from "joi";

export const listAdminWalletTransactionsValidation = Joi.object({
  // clientId: Joi.string().optional().allow("", null),
  type: Joi.string()
    .valid("CREDITED", "DEBITED", "REFUNDED")
    .optional()
    .allow("", null),

  key: Joi.string().valid("CUSTOMER").optional().allow(null),
  id: Joi.string().optional().allow(null),

  source: Joi.string().valid("WALLET", "RAZORPAY").optional().allow("", null),
  search: Joi.string().optional().valid("", null),
  limit: Joi.number().optional().allow("", null),
  offset: Joi.number().optional().allow("", null),
});

export const listWalletCustomerTransactionsValidation = Joi.object({
  clientId: Joi.string().optional().allow("", null),
  type: Joi.string()
    .valid("CREDITED", "DEBITED", "REFUNDED")
    .optional()
    .allow("", null),
  source: Joi.string().valid("WALLET", "RAZORPAY").optional().allow("", null),
  search: Joi.string().optional().valid("", null),
  limit: Joi.number().optional().allow("", null),
  offset: Joi.number().optional().allow("", null),
});

export const getCustomerSelectValidation = Joi.object({
  clientId: Joi.string().optional().allow(null),
});

export const addBalanceToWalletValidation = Joi.object({
  amount: Joi.number().required(),
});
