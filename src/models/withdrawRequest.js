import mongoose from "mongoose";
import { generatePublicId } from "../commons/common-functions";

const WithdrawRequestSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    trim: true,
    default: generatePublicId,
  },
  clientId: { type: String, required: true, trim: true },
  requestedAmount: { type: Number, required: true, trim: true },
  upiId: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  accountNumber: { type: String },
  ifscCode: { type: String },
  branchName: { type: String },
  accountHolderName: { type: String },
  paymentMethod: { type: String, enum: ["UPI", "BANK"], required: true },
  status: {
    type: String,
    required: true,
    enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "REJECTED"],
  },
  reason: { type: String, trim: true },
  requestedDate: { type: String },
  completedDate: { type: String },
  transactionId: { type: String, trim: true },
  created_by: { type: String },
  updated_by: { type: String },
  created_at: { type: String },
  updated_at: { type: String },
  isDeleted: { type: Boolean, default: false },
});

const WithdrawRequestModel = mongoose.model(
  "withdraw-request",
  WithdrawRequestSchema
);

export default WithdrawRequestModel;
