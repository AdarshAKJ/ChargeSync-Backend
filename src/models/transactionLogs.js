import mongoose from "mongoose";
import { generatePublicId } from "../commons/common-functions";
const TransactionLogsSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    trim: true,
    default: generatePublicId,
  },
  transactionId: { type: String, required: true, trim: true },
  context: { type: String, required: true },
  measurand: { type: String, required: true },
  value: { type: Number, required: true },
  created_by: { type: String },
  updated_by: { type: String },
  created_at: { type: String },
  updated_at: { type: String },
});

const TransactionLogsModel = mongoose.model(
  "transaction-logs",
  TransactionLogsSchema
);

export default TransactionLogsModel;
