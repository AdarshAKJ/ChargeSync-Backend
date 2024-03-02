import Joi from "joi";

export const createChargerValidation = Joi.object({
  clientId: Joi.string().required(),
  stationId: Joi.string().required(),
  serialNumber: Joi.string().required(),
  name: Joi.string().required(),
  powerType: Joi.string().required().allow("AC", "DC"),
  connectorDetails: Joi.array()
    .items(
      Joi.object({
        connectorId: Joi.string().required().allow("1", "2", "3"),
        connectorType: Joi.string().required().allow("CCS2", "TYPE2"),
        pricePerUnit: Joi.number().required(),
      })
    )
    .min(1)
    .max(4),
  maxCapacity: Joi.number()
    .optional()
    .allow("1.1", "3.3", "7.4", "7.7", "10", "15", "22", "30", "60"),
});

export const updateChargerValidation = Joi.object({
  id: Joi.string().required(),
  clientId: Joi.string().required(),
  stationId: Joi.string().required(),
  name: Joi.string().required(),
  powerType: Joi.string().required().allow("AC", "DC"),
  maxCapacity: Joi.number()
    .optional()
    .allow("1.1", "3.3", "7.4", "7.7", "10", "15", "22", "30", "60"),
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

export const updateConnectorPricePerUnitValidation = Joi.object({
  chargerId: Joi.string().required(),
  connectorDetails: Joi.array()
    .items(
      Joi.object({
        connectorId: Joi.string().required().allow("1", "2", "3"),
        connectorType: Joi.string().required().allow("CCS2", "TYPE2"),
        pricePerUnit: Joi.number().required(),
      })
    )
    .min(1)
    .max(4),
});
