import Joi from "joi";

export const createChargerValidation = Joi.object({
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
export const getSerialNumberqValidation = Joi.object({
  clientId: Joi.string().required(),
  // stationId: Joi.string().required(),
  // serialNumber: Joi.string().required(),
  // name: Joi.string().required(),
  // connectorCount: Joi.number().required(),
  // connectorDetails: Joi.array()
  //   .items(
  //     Joi.object({
  //       connectorId: Joi.string().required(),
  //       pricePerUnit: Joi.number().required(),
  //     })
  //   )
  //   .unique((a, b) => a.connectorId === b.connectorId)
  //   .required(),
});
export const updateChargerValidation = Joi.object({
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
