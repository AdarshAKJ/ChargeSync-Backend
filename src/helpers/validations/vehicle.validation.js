import Joi from "joi";

export const createVehicleValidation = Joi.object({
  name: Joi.string().trim().required(),
  description: Joi.string().allow("").trim(),
  vehicleNumber: Joi.string().trim().required(),
  vehicleType: Joi.string().allow("").trim(),
});
export const updateVehicleValidation = Joi.object({
  id: Joi.string().trim().required(),
  name: Joi.string().trim().required(),
  description: Joi.string().allow("").trim(),
  vehicleNumber: Joi.string().trim().required(),
  vehicleType: Joi.string().allow("").trim(),
});

export const singleVehicleValidation = Joi.object({
  id: Joi.string().trim().required(),
});
