import Joi from "joi";

export const createVehicleValidation = Joi.object({
  clientId: Joi.string().trim().required(),
  userId: Joi.string().trim().required(),
  name: Joi.string().trim().required(),
  description: Joi.string().allow("").trim(),
  vehicleNumber: Joi.string().trim().required(),
  vehicleType: Joi.string().allow("").trim(),
  created_by: Joi.string().allow("").trim(),
  updated_by: Joi.string().allow("").trim(),
  created_at: Joi.string().allow("").trim(),
  updated_at: Joi.string().allow("").trim(),
  isDeleted: Joi.boolean().default(false),
});
export const updateVehicleValidation = Joi.object({
  id: Joi.string().trim().required(),
  clientId: Joi.string().trim().required(),
  userId: Joi.string().trim().required(),
  name: Joi.string().trim().required(),
  description: Joi.string().allow("").trim(),
  vehicleNumber: Joi.string().trim().required(),
  vehicleType: Joi.string().allow("").trim(),
  created_by: Joi.string().allow("").trim(),
  updated_by: Joi.string().allow("").trim(),
  created_at: Joi.string().allow("").trim(),
  updated_at: Joi.string().allow("").trim(),
  isDeleted: Joi.boolean().default(false),
});
export const listVehicleValidation = Joi.object({
  clientId: Joi.string().trim().required(),
  userId: Joi.string().trim().required(),
});
export const singleVehicleValidation = Joi.object({
  id: Joi.string().trim().required(),
  clientId: Joi.string().trim().required(),
  userId: Joi.string().trim().required(),
});
