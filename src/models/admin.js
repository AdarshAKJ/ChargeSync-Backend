import mongoose from "mongoose";
import { generatePublicId } from "../commons/common-functions";

const adminSchema = new mongoose.Schema({
  _id: { type: String, required: true, trim: true, default: generatePublicId },
  fname: { type: String, required: true },
  lname: { type: String },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
    default: "Male",
  },
  status: {
    type: String,
    enum: ["ACTIVE", "BLOCKED"],
    required: true,
    trim: true,
    default: "ACTIVE",
  },
  email: { type: String, unique: true },
  phone: { type: String, unique: true },
  password: { type: String, required: true },
  lastLogin: { type: String },
  created_by: { type: String },
  updated_by: { type: String },
  created_at: { type: String },
  updated_at: { type: String },
  isDeleted: { type: Boolean, default: false },
});

const AdminModel = mongoose.model("admin", adminSchema);

export default AdminModel;
