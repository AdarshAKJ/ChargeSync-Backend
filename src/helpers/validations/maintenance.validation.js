import Joi from "joi";

// Define Joi schema for Maintenance
export const maintenanceValidation = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  startDate: Joi.string().required(),
  endDate: Joi.string().required(),
  status: Joi.string()
    .valid("UP-TO-COME", "ACTIVE", "COMPLETED")
    .default("UP-TO-COME"),
  created_by: Joi.string(),
  updated_by: Joi.string(),
  created_at: Joi.string(),
  updated_at: Joi.string(),
});
