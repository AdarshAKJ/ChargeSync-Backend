import Joi from "joi/lib";

export const createClientValidation = Joi.object({
  username: Joi.string().min(3).max(20).required(),
  name: Joi.string().min(3).max(50).required(),
  contactPerson: Joi.string().min(3).max(50).required(),
  contactPersonEmailAddress: Joi.string().email().required(),
  prefix: Joi.string().max(10).required(),
  contactPersonPhoneNumber: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),
  documents: Joi.array()
    .items(
      Joi.object({
        type: Joi.string().required(),
        path: Joi.string().required(),
      })
    )
    .optional(),
  countryCode: Joi.string().optional(),
  address: Joi.string().min(5).max(100).optional(),
});

export const updateClientValidation = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  contactPerson: Joi.string().min(3).max(50).required(),
  contactPersonEmailAddress: Joi.string().email().required(),
  prefix: Joi.string().max(10).required(),
  contactPersonPhoneNumber: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),
  documents: Joi.array()
    .items(
      Joi.object({
        type: Joi.string().required(),
        path: Joi.string().required(),
      })
    )
    .required(),
  countryCode: Joi.string().optional(),
  address: Joi.string().min(5).max(100).optional(),
});

export const loginClientValidation = Joi.object({
  contactPersonEmailAddress: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const listClientValidation = Joi.object({
  clientId: Joi.string().required(),
});

export const clientForgotPasswordValidation = Joi.object({
  email: Joi.string().email().required(),
});

export const clientResetPasswordValidation = Joi.object({
  token: Joi.string().required(),
  new_password: Joi.string().min(6).required(),
  compare_password: Joi.string()
    .valid(Joi.ref("new_password"))
    .required()
    .strict(),
});