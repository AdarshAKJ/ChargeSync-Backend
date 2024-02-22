import Joi from "joi";

export const listChargerStationValidation = Joi.object({
  clientId: Joi.string().required(),
});
