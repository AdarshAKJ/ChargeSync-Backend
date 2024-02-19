import Joi from "joi";

export const createChargerStationValidation = Joi.object({
  clientId: Joi.string().required(),
  station_name: Joi.string().max(30).required(),
  address: Joi.object({
    area: Joi.string().required(),
    city: Joi.string().required(),
    postal: Joi.string().required(),
    countryCode: Joi.string().required(),
    coordinates: Joi.object({
      latitude: Joi.string().required(),
      longitude: Joi.string().required(),
    }),
  }),
  station_facilities: Joi.array().optional().allow(null),
  station_images: Joi.array().optional().allow(null),
});

export const updateChargerStationValidation = Joi.object({
  id: Joi.string().required(),
  clientId: Joi.string().required(),
  station_name: Joi.string().max(30).required(),
  address: Joi.object({
    area: Joi.string().required(),
    city: Joi.string().required(),
    postal: Joi.string().required(),
    countryCode: Joi.string().required(),
    coordinates: Joi.object({
      latitude: Joi.string().required(),
      longitude: Joi.string().required(),
    }),
  }),
  station_facilities: Joi.array().optional().allow(null),
  station_images: Joi.array().optional().allow(null),
});
