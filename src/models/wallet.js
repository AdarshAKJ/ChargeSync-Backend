import mongoose from "mongoose";
import { generatePublicId } from "../commons/common-functions";

const WalletSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    trim: true,
    default: generatePublicId,
  },
  customerId: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, trim: true },
  created_by: { type: String },
  updated_by: { type: String },
  created_at: { type: String },
  updated_at: { type: String },
  isDeleted: { type: Boolean, default: false },
});

const WalletModel = mongoose.model("wallet", WalletSchema);

export default WalletModel;
