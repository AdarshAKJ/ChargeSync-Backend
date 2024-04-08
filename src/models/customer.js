import mongoose from "mongoose";
import { generatePublicId } from "../commons/common-functions";

const CustomerSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    trim: true,
    default: generatePublicId,
  },
  fname: { type: String, trim: true },
  lname: { type: String, trim: true },
  email: { type: String, trim: true },
  isBlocked: { type: Boolean, default: false },
  password: { type: String },
  phoneNumber: { type: String },
  address: { type: Object, trim: true },
  dob: { type: String },
  countryCode: { type: String },
  isVerified: { type: Boolean, required: true, default: false },
  termAndCondition: { type: Boolean, required: true, default: false },
  loginBy: { type: String, trim: true, enum: ["EMAIL", "PHONE"] },
  lastLogin: { type: String, trim: true },
  otpSecret: { type: [] },
  created_by: { type: String },
  updated_by: { type: String },
  created_at: { type: String },
  updated_at: { type: String },
  isDeleted: { type: Boolean, default: false },
});

const CustomerModel = mongoose.model("customer", CustomerSchema);

export default CustomerModel;
