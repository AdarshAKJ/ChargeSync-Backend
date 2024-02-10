import Joi from "joi";

export const createAdminValidation = Joi.object({
  id: Joi.string().required(),
  fname: Joi.string().required().messages({
    "any.required": `Please provide the valid name.`,
    "string.base": "Please provide the valid name",
  }),
  lname: Joi.string().required().messages({
    "any.required": "Please provide the valid name",
    "string.base": "Please provide the valid name",
  }),
  gender: Joi.string().valid("Male", "Female", "Others").optional(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .min(7)
    .max(12)
    .pattern(/^[0-9]+$/)
    .optional(),
  password: Joi.string().required(),
});

export const updateAdminValidation = Joi.object({
  id: Joi.string().required(),
  // auth_type: Joi.string().optional().allow(null),
  fname: Joi.string().optional().messages({
    "any.required": `Please provide the valid name.`,
    "string.base": "Please provide the valid name",
  }),
  lname: Joi.string().optional().messages({
    "any.required": "Please provide the valid name",
    "string.base": "Please provide the valid name",
  }),
  email: Joi.string().email().required(),
  gender: Joi.string().valid("Male", "Female", "Others").optional(),
  status: Joi.string().valid("ACTIVE", "INACTIVE").optional(),
  phone: Joi.string()
    .min(7)
    .max(12)
    .pattern(/^[0-9]+$/)
    .optional(),
});

export const listAdminValidation = Joi.object({});

export const deleteAdminValidation = Joi.object({
  id: Joi.string().required(),
});

export const loginAdminValidation = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});
