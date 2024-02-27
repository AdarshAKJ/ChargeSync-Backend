import Joi from 'joi';

const walletTransactionValidation = Joi.object({
  clientId: Joi.string().trim().required(),
  type: Joi.string().valid('CREDITED', 'DEBITED', 'REFUNDED').required(),
  source: Joi.string().valid('WALLET', 'RAZORPAY').required(),
  created_by: Joi.string().trim(),
  updated_by: Joi.string().trim(),
  created_at: Joi.string().trim(),
  updated_at: Joi.string().trim(),
  isDeleted: Joi.boolean().default(false),
});

export default walletTransactionValidation;