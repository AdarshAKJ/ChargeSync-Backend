import mongoose from "mongoose";
import { generatePublicId } from "../commons/common-functions";

const clientSchema = new mongoose.Schema({
  _id: { type: String, required: true, trim: true, default: generatePublicId },
  name: { type: String, required: true },
  contactPerson: { type: String, required: true },
  contactPersonEmailAddress: { type: String, required: true },
  contactPersonPhoneNumber: { type: String, required: true },
  countryCode: { type: String, required: true },
  address: { type: String, required: true },
  status: {
    type: String,
    enum: ["ACTIVE", "BLOCKED"],
    required: true,
    trim: true,
    default: "ACTIVE",
  },
  onBoard:{type: Boolean, },
  subscriptionId: { type: String, required: true },
  // documents like array [{type:"NDA", path:"s3://s3.amazonaws.com"}]
  documents: {
    type: [],
  },
  lastPaymentPaid: { type: Boolean, required: true, default: true },
  created_by: { type: String },
  updated_by: { type: String },
  created_at: { type: String },
  updated_at: { type: String },
});

const UserModel = mongoose.model("client", clientSchema);

export default UserModel;
