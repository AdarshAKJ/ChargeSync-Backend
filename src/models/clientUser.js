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
    enum: ["ADMIN", "ACCOUNT", "OPERATION", "REPORTER"],
    required: true,
  },
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  countryCode: { type: String, required: true },
  password: { type: String, required: true },
  address: { type: String },
  isAdminCreated: { type: Boolean , default: false},
  status: {
    type: String,
    enum: ["ACTIVE", "BLOCKED"],
    required: true,
    trim: true,
    default: "ACTIVE",
  },
  // documents: {
  //   type: [],
  // },
  lastLogin: { type: String },
  created_by: { type: String },
  updated_by: { type: String },
  created_at: { type: String },
  updated_at: { type: String },
  isDeleted: { type: Boolean, default: false },
});

const ClientUserModel = mongoose.model("client-user", clientUserSchema);

export default ClientUserModel;
