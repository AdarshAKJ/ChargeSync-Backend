import Joi from "joi";
import { REGISTER } from "../../commons/global-constants";

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
  email: Joi.string().when("login_type", {
    is: REGISTER.LOGIN_TYPE_EMAIL,
    then: Joi.string().email().required(),
  }),
  phone: Joi.string().when("login_type", {
    is: REGISTER.LOGIN_TYPE_PHONE_NUMBER,
    then: Joi.string()
      .min(7)
      .max(12)
      .pattern(/^[0-9]+$/),
    // .required(),
  }),
  password: Joi.string().required(),
});

export const updateAdminValidation = Joi.object({
  id: Joi.string().required(),
  // auth_type: Joi.string().optional().allow(null),
  fname: Joi.string().required().messages({
    "any.required": `Please provide the valid name.`,
    "string.base": "Please provide the valid name",
  }),
  lname: Joi.string().required().messages({
    "any.required": "Please provide the valid name",
    "string.base": "Please provide the valid name",
  }),
  email: Joi.string().when("login_type", {
    is: REGISTER.LOGIN_TYPE_EMAIL,
    then: Joi.string().email().required(),
  }),
  phone: Joi.string().when("login_type", {
    is: REGISTER.LOGIN_TYPE_PHONE_NUMBER,
    then: Joi.string()
      .min(7)
      .max(12)
      .pattern(/^[0-9]+$/)
      .required(),
  }),
});

export const listAdminValidation = Joi.object({});

export const deleteAdminValidation = Joi.object({
  id: Joi.string().required(),
  email: Joi.string().when("login_type", {
    is: REGISTER.LOGIN_TYPE_EMAIL,
    then: Joi.string().email().required(),
  }),
  phone: Joi.string().when("login_type", {
    is: REGISTER.LOGIN_TYPE_PHONE_NUMBER,
    then: Joi.string()
      .min(7)
      .max(12)
      .pattern(/^[0-9]+$/)
      .required(),
  }),
});
