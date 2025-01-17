import Joi from "joi";

const dashboardValidation = Joi.object({
  clientId: Joi.string().required(),
  // type: Joi.string()
  //   .valid("CREDITED", "DEBITED", "REFUNDED")
  //   .optional()
  //   .allow("", null),
  // source: Joi.string().valid("WALLET", "RAZORPAY").optional().allow("", null),
  // search: Joi.string().optional().valid("", null),
  // limit: Joi.number().optional().allow("", null),
  // offset: Joi.number().optional().allow("", null),
});

export default dashboardValidation;
