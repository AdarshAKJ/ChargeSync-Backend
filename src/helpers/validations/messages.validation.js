import Joi from "joi";

export const messageValidation = Joi.object({
  clientId: Joi.string().optional(),
  messageIds: Joi.array().items(Joi.string()).min(1).max(100).required(),
});

export const cidMessageValidation = Joi.object({
  clientId: Joi.string().required(),
});
