import mongoose from "mongoose";

const chargingStationSchema = new mongoose.Schema({
  station_id: { type: String, required: true },
  station_name: { type: String, required: true },
  address: {
    area: { type: String, required: true },
    city: { type: String, required: true },
    postal: { type: String, required: true },
    countryCode: { type: String, required: true },
    coordinates: {
      latitude: { type: String, required: true },
      longitude: { type: String, required: true },
    },
  },
  organization: { type: String, required: true },
  chargingPoint: { type: [], required: true },
  amenities: { type: [] },
  station_facilities: { type: [], required: true },
  station_images: { type: "string" },
});

const chargingStationModel = mongoose.model(
  "chargingStation",
  chargingStationSchema
);

export default chargingStationSchema;
