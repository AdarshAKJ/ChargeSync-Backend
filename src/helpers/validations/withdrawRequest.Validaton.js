import Joi from "joi";

export const createWithdrawRequestValidation = Joi.object({
  requestedAmount: Joi.number().required(),
  upiId: Joi.string().when("paymentMethod", {
    is: "UPI",
    then: Joi.string().required(),
    otherwise: Joi.string().allow("").optional(),
  }),
  name: Joi.string().when("paymentMethod", {
    is: "UPI",
    then: Joi.string().required(),
    otherwise: Joi.string().allow("").optional(),
  }),
  accountNumber: Joi.string().when("paymentMethod", {
    is: "BANK",
    then: Joi.string().required(),
    otherwise: Joi.string().allow("").optional(),
  }),
  ifscCode: Joi.string().when("paymentMethod", {
    is: "BANK",
    then: Joi.string().required(),
    otherwise: Joi.string().allow("").optional(),
  }),
  branchName: Joi.string().when("paymentMethod", {
    is: "BANK",
    then: Joi.string().required(),
    otherwise: Joi.string().allow("").optional(),
  }),
  accountHolderName: Joi.string().when("paymentMethod", {
    is: "BANK",
    then: Joi.string().required(),
    otherwise: Joi.string().allow("").optional(),
  }),
  paymentMethod: Joi.string().valid("UPI", "BANK").required(),
});


export const updateWithdrawRequestValidationByClient = Joi.object({
  clientId: Joi.string().required(),
  requestedAmount: Joi.number().required(),
  upiId: Joi.string().when("paymentMethod", {
      is: "UPI",
      then: Joi.string().required(),
      otherwise: Joi.string().allow("").optional(),
  }),
  name: Joi.string().when("paymentMethod", {
      is: "UPI",
      then: Joi.string().required(),
      otherwise: Joi.string().allow("").optional(),
  }),
  accountNumber: Joi.string().when("paymentMethod", {
      is: "BANK",
      then: Joi.string().required(),
      otherwise: Joi.string().allow("").optional(),
  }),
  ifscCode: Joi.string().when("paymentMethod", {
      is: "BANK",
      then: Joi.string().required(),
      otherwise: Joi.string().allow("").optional(),
  }),
  branchName: Joi.string().when("paymentMethod", {
      is: "BANK",
      then: Joi.string().required(),
      otherwise: Joi.string().allow("").optional(),
  }),
  accountHolderName: Joi.string().when("paymentMethod", {
      is: "BANK",
      then: Joi.string().required(),
      otherwise: Joi.string().allow("").optional(),
  }),
  paymentMethod: Joi.string().valid("UPI", "BANK").required(),
  status: Joi.string().valid("PENDING").required(),
});


export const updateWithdrawRequestByAdminValidation = Joi.object({
  status: Joi.string().valid("COMPLETED", "REJECTED"),
  transactionId: Joi.string().when("status", { is: "COMPLETED", then: Joi.string().required() }),
  note: Joi.string().allow("").optional()
});


