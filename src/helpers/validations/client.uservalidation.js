import Joi from "joi";

export const createClientUserValidation = Joi.object({
  clientId: Joi.string().required(),
  roleId: Joi.string()
    .valid("ADMIN", "ACCOUNT", "OPERATION", "REPORTER")
    .required(),
  fname: Joi.string().required(),
  lname: Joi.string().required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string()
    .min(7)
    .max(12)
    .pattern(/^[0-9]+$/)
    .optional(),
  countryCode: Joi.string().required(),
  password: Joi.string().required(),
  address: Joi.string().required(),
  status: Joi.string().valid("ACTIVE", "BLOCKED").required(),
  documents: Joi.array()
    .items(
      Joi.object({
        type: Joi.string().required(),
        path: Joi.string().required(),
      })
    )
    .required(),
});

export const updateClientUserValidation = Joi.object({
  clientId: Joi.string().required(),
  roleId: Joi.string()
    .valid("ADMIN", "ACCOUNT", "OPERATION", "REPORTER")
    .required(),
  fname: Joi.string().required(),
  lname: Joi.string().required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string()
    .min(7)
    .max(12)
    .pattern(/^[0-9]+$/)
    .optional(),
  countryCode: Joi.string().required(),
  password: Joi.string().required(),
  address: Joi.string().required(),
  status: Joi.string().valid("ACTIVE", "BLOCKED").required(),
  documents: Joi.array()
    .items(
      Joi.object({
        type: Joi.string().required(),
        path: Joi.string().required(),
      })
    )
    .required(),
});
