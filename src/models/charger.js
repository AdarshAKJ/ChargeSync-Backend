import mongoose from "mongoose";
import { generatePublicId } from "../commons/common-functions";

const ChargerSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    trim: true,
    default: generatePublicId,
  },
  clientId: { type: String, required: true, trim: true },
  stationId: { type: String, required: true },
  serialNumber: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["ONLINE", "OFFLINE", "CONFIGURING"],
    default: "CONFIGURING",
  },
  maxCapacity: { type: Number },
  connectorCount: { type: Number },
  chargerKey: { type: String, required: true },
  created_by: { type: String },
  updated_by: { type: String },
  created_at: { type: String },
  updated_at: { type: String },
  isDeleted: { type: Boolean, default: false },
});

const ChargerModel = mongoose.model("charger", ChargerSchema);

export default ChargerModel;
