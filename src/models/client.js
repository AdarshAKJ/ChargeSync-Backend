import mongoose from "mongoose";
import { generatePublicId } from "../commons/common-functions";

const clientSchema = new mongoose.Schema({
  _id: { type: String, required: true, trim: true, default: generatePublicId },
  name: { type: String, required: true },
  contactPerson: { type: String, required: true },
  contactPersonEmailAddress: { type: String, required: true },
  contactPersonPhoneNumber: { type: String, required: true },
  countryCode: { type: String, required: true },
  address: {
    type: {
      street_address_line1: { type: String },
      street_address_line2: { type: String },
      city: { type: String },
      state: { type: String },
      postal_code: { type: String },
      country: { type: String },
    },
    required: false,
  },
  prefix: { type: String, required: true },
  status: {
    type: String,
    enum: ["ACTIVE", "BLOCKED"],
    required: true,
    trim: true,
    default: "ACTIVE",
  },
  onBoard: { type: Boolean },
  subscriptionId: { type: String, required: true },
  documents: {
    type: [],
  },
  lastPaymentPaid: { type: Boolean, required: true, default: true },
  serialNumberCount: { type: Number, required: true, default: 0 },
  created_by: { type: String },
  updated_by: { type: String },
  created_at: { type: String },
  updated_at: { type: String },
  isDeleted: { type: Boolean, default: false },
});

const ClientModel = mongoose.model("client", clientSchema);

export default ClientModel;
