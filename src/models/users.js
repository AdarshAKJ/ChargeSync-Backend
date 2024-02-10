import mongoose from "mongoose";
import { generatePublicId } from "../commons/common-functions";

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true, trim: true, default: generatePublicId },
  workspace_id: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    default: generatePublicId,
  },
  companyName: { type: String },
  workspace_details: {
    company_name: { type: String, trim: true },
    primary_domain: { type: String, trim: true },
  },
  status: {
    type: String,
    enum: ["ACTIVE", "BLOCKED"],
    required: true,
    trim: true,
    default: "ACTIVE",
  },
  auth_type: {
    type: String,
    enum: ["SELF", "GOOGLE", "FACEBOOK"],
    default: "SELF",
    trim: true,
  },
  email: { type: String },
  phone: { type: Number },
  is_verified: { type: Boolean, trim: true },
  login_type: { type: String, required: true, enum: ["PHONE", "EMAIL"] },
  profile_photo: { type: String },
  fname: { type: String, required: true },
  lname: { type: String },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
    default: "Male",
  },
  dob: { type: String },
  token: { type: String }, // this is JWT token for the user
  password: { type: String },
  payment_status: {
    type: String,
    enum: ["ACTIVE", "PENDING", "CANCELED"],
    default: "PENDING",
  }, // this is use for first time when user add the card to the system.
  stripe_customer_id: { type: String },
  plan_id: { type: String },
  plane_name: { type: String },
  plan_type: { type: String, enum: ["Monthly", "Yearly"], default: "Monthly" },
  plan_status: {
    type: String,
    enum: ["ACTIVE", "TRIALING", "CANCELED", "DEACTIVATED", "PAST_DUE"],
  },
  subscription_id: { type: String },
  is_subscription_cancel: { type: Boolean, default: false },
  is_subscription_due: { type: Boolean, default: false },
  payment_method_id: { type: String },
  initial_payment_intent_id: { type: String },
  license_count: { type: Number, default: 0 }, // member creation is there.
  lastLogin: { type: String },
  created_by: { type: String },
  updated_by: { type: String },
  created_at: { type: String },
  updated_at: { type: String },
});

const UserModel = mongoose.model("users", userSchema);

export default UserModel;
