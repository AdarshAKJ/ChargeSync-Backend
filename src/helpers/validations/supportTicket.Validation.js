import Joi from "joi";

export const createSupportTicketValidation = Joi.object({
    clientId: Joi.string(),
    subject: Joi.string().required(),
    description: Joi.string(),
    status: Joi.string().valid('OPEN', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED'),
    title: Joi.string().required(),
    message: Joi.string().required(),
    assignTo: Joi.string(),
  });
  
  export const updateSupportTicketValidation = Joi.object({
    clientId: Joi.string().optional(),
    subject: Joi.string().optional(),
    description: Joi.string().optional(),
    status: Joi.string().valid('OPEN', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED').optional(),
    title: Joi.string().optional(),
    message: Joi.string().optional(),
    assignTo: Joi.string().optional(),
  });
  
  export const deleteTicketValidation = Joi.object({
    params: Joi.object({
      id: Joi.string().required(),
    }),
  });