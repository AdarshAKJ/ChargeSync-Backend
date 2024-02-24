import mongoose from "mongoose";
import { generatePublicId } from "../commons/common-functions";

const VehicleSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    trim: true,
    default: generatePublicId,
  },
  clientId: { type: String, required: true, trim: true },
  userId: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  description: { type: String },
  vehicleNumber: { type: String, required: true },
  vehicleType: { type: String },
  created_by: { type: String },
  updated_by: { type: String },
  created_at: { type: String },
  updated_at: { type: String },
  isDeleted: { type: Boolean, default: false },
});

const VehicleModel = mongoose.model("vehicle", VehicleSchema);

export default VehicleModel;
