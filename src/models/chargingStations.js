import mongoose from "mongoose";
import { generatePublicId } from "../commons/common-functions";

const chargingStationSchema = new mongoose.Schema({
  _id: { type: String, required: true, default: generatePublicId },
  clientId: { type: String, required: true },
  station_name: { type: String, required: true },
  address: {
    area: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postal: { type: String, required: true },
    countryCode: { type: String, required: true },
    coordinates: {
      latitude: { type: String, required: false },
      longitude: { type: String, required: false },
    },
  },
  own_by: { type: String },
  contact_no: { type: String },
  contact_email: { type: String },
  station_facilities: { type: [] },
  station_images: { type: [] },
  created_by: { type: String },
  updated_by: { type: String },
  created_at: { type: String },
  updated_at: { type: String },
  isDeleted: { type: Boolean, default: false },
});

const ChargingStationModel = mongoose.model(
  "charging-station",
  chargingStationSchema
);

export default ChargingStationModel;
