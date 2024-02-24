import Joi from "joi";

export const singleTransactionLogsValidation = Joi.object({
  id: Joi.string().required(),
  clientId: Joi.string().required(),
});
