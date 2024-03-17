import mongoose from "mongoose";
import { generatePublicId } from "../commons/common-functions";

const SupportTicketSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    trim: true,
    default: generatePublicId,
  },
  clientId: { type: String },
  subject: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ["OPEN", "IN_PROGRESS", "ON_HOLD", "RESOLVED", "CLOSED"],
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  assignTo: { type: String },
  created_at: { type: String, required: true },
  updated_at: { type: String, required: true },
  resolved_at: { type: String },
  closed_at: { type: String },
});

const SupportTicketsModel = mongoose.model(
  "support-tickets",
  SupportTicketSchema
);

export default SupportTicketsModel;
