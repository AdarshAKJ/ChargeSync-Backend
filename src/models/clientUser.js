import mongoose from "mongoose";
import { generatePublicId } from "../commons/common-functions";

const clientUserSchema = new mongoose.Schema({
  _id: { type: String, required: true, trim: true, default: generatePublicId },
  clientId: {
    type: String,
    required: true,
    trim: true,
  },
  roleId: {
    type: String,
    enum: ["ADMIN", "ACCOUNT", "OPERATION"],
    required: true,
  },
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  countryCode: { type: String, required: true },
  password: { type: String, required: true },
  address: { type: String },
  status: {
    type: String,
    enum: ["ACTIVE", "BLOCKED"],
    required: true,
    trim: true,
    default: "ACTIVE",
  },
  documents: {
    type: [],
  },
  lastLogin: { type: String, required: true },
  created_by: { type: String },
  updated_by: { type: String },
  created_at: { type: String },
  updated_at: { type: String },
});

const UserModel = mongoose.model("client-user", clientUserSchema);

export default UserModel;
