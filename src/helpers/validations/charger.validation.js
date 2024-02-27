import Joi from "joi";

export const createChargerValidation = Joi.object({
  clientId: Joi.string().required(),
  stationId: Joi.string().required(),
  serialNumber: Joi.string().required(),
  name: Joi.string().required(),
  status: Joi.string()
    .valid("ONLINE", "OFFLINE", "CONFIGURING")
    .default("CONFIGURING"),
  connectorCount: Joi.number().optional(),
  maxCapacity: Joi.number().optional(),
});

export const updateChargerValidation = Joi.object({
  id: Joi.string().required(),
  clientId: Joi.string().required(),
  stationId: Joi.string().required(),
  serialNumber: Joi.string().required(),
  name: Joi.string().required(),
  status: Joi.string().valid("ONLINE", "OFFLINE", "CONFIGURING").required(),
  connectorCount: Joi.number().optional(),
  maxCapacity: Joi.number().optional(),
});

export const getSerialNumberValidation = Joi.object({
  clientId: Joi.string().required(),
});

export const deleteChargerValidation = Joi.object({
  id: Joi.string().required(),
  clientId: Joi.string().required(),
});

export const listChargerValidation = Joi.object({
  clientId: Joi.string().required(),
});
export const singleChargerValidation = Joi.object({
  id: Joi.string().required(),
  clientId: Joi.string().required(),
});

export const getChargerCountValidation = Joi.object({
  clientId: Joi.string().required(),
});
export const getSerialNumberqValidation = Joi.object({
  clientId: Joi.string().required(),
  stationId: Joi.string().required(),
  serialNumber: Joi.string().required(),
  name: Joi.string().required(),
  connectorCount: Joi.number().required(),
  connectorDetails: Joi.array()
    .items(
      Joi.object({
        connectorId: Joi.string().required(),
        pricePerUnit: Joi.number().required(),
      })
    )
    .unique((a, b) => a.connectorId === b.connectorId)
    .required(),
});
