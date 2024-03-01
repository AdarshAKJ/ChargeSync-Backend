import Joi from "joi";

export const messageValidation = Joi.object({
        messageIds: Joi.array().items(Joi.string()).min(1).max(100).required()
  });

export const cidmessageValidation = Joi.object({
      clientId: Joi.string().required(),
});