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
    .required(),
  countryCode: Joi.string().required(),
  password: Joi.string().required(),
  address: Joi.string().required(),
});

export const updateClientUserValidation = Joi.object({
  id: Joi.string().required(),
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
    .optional()
    .allow(null),
  countryCode: Joi.string().required(),
  address: Joi.string().required(),
  status: Joi.string().valid("ACTIVE", "BLOCKED").default("ACTIVE").optional(),
  documents: Joi.array()
    .items(
      Joi.object({
        type: Joi.string().optional().allow(null),
        path: Joi.string().optional().allow(null),
      })
    )
    .optional(),
});

export const loginClientUserValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
export const deleteClientUserValidation = Joi.object({
  id: Joi.string().required(),
  clientId: Joi.string().required(),
});

export const singleClientUserValidation = Joi.object({
  clientId: Joi.string().required(),
});

export const listClientUserValidation = Joi.object({
  clientId: Joi.string().required(),
});

export const clientUserForgotPasswordValidation = Joi.object({
  email: Joi.string().email().required(),
});

export const clientUserResetPasswordValidation = Joi.object({
  token: Joi.string().required(),
  new_password: Joi.string().min(6).required(),
  compare_password: Joi.string()
    .valid(Joi.ref("new_password"))
    .required()
    .strict(),
});