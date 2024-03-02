import Joi from "joi";

export const listTransactionsValidation = Joi.object({
  clientId: Joi.string().required(),
  key: Joi.string()
    .valid("CUSTOMER", "CHARGER", "STATION")
    .optional()
    .allow(null),
  id: Joi.string().optional().allow(null),
});
export const singleTransactionValidation = Joi.object({
  id: Joi.string().required(),
  clientId: Joi.string().required(),
});
export const customerTransactionsValidation = Joi.object({
  clientId: Joi.string().required(),
  connectorId: Joi.string().required(),
});
export const singlecustomerTransactionsValidation = Joi.object({
  id: Joi.string().required(),
  clientId: Joi.string().required(),
  connectorId: Joi.string().required(),
});
