import Joi from "joi";

export const listTransactionsValidation = Joi.object({
  clientId: Joi.string().required(),
});
export const singleTransactionValidation = Joi.object({
  Id: Joi.string().required(),
  clientId: Joi.string().required(),
});
