import mongoose from "mongoose";
import { generatePublicId } from "../commons/common-functions";

const subscriptionSchema = new mongoose.Schema({
  _id: { type: String, required: true, trim: true, default: generatePublicId },
  name: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ["ACTIVE", "DE_ACTIVE"],
    required: true,
    trim: true,
    default: "ACTIVE",
  },
  price: { type: Number, required: true },
  maxUserCount: { type: Number, required: true },
  created_by: { type: String },
  updated_by: { type: String },
  created_at: { type: String },
  updated_at: { type: String },
});

const UserModel = mongoose.model("subscription", subscriptionSchema);

export default UserModel;
