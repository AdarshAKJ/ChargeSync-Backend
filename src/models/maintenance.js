import mongoose from "mongoose";
import { generatePublicId } from "../commons/common-functions";

const MaintenanceSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    trim: true,
    default: generatePublicId,
  },
  name: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["UP-TO-COME", "ACTIVE", "COMPLETED"],
    default: "UP-TO-COME",
  },
  created_by: { type: String },
  updated_by: { type: String },
  created_at: { type: String },
  updated_at: { type: String },
});

const MaintenanceModel = mongoose.model("maintenance", MaintenanceSchema);

export default MaintenanceModel;
