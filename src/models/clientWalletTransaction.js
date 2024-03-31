import mongoose from "mongoose";
import { generatePublicId } from "../commons/common-functions";

const ClientWalletTransactionSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    trim: true,
    default: generatePublicId,
  },
  clientId: { type: String, required: true, trim: true },
  preBalance: { type: Number, required: true, trim: true },
  effectedBalance: { type: Number, required: true, trim: true },
  amount: { type: Number, required: true, trim: true },
  type: {
    type: String,
    required: true,
    enum: ["CREDITED", "DEBITED"],
  },
  reason: { type: String, trim: true },
  source: {
    type: String,
    required: true,
    enum: ["WALLET", "RAZORPAY", "OTHER"],
  },
  created_by: { type: String },
  updated_by: { type: String },
  created_at: { type: String },
  updated_at: { type: String },
  isDeleted: { type: Boolean, default: false },
});

const ClientWalletTransactionModel = mongoose.model(
  "client-wallet-transaction",
  ClientWalletTransactionSchema
);

export default ClientWalletTransactionModel;
