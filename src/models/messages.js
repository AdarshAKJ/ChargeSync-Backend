import mongoose from "mongoose";
import { generatePublicId } from "../commons/common-functions";

const MessageSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    trim: true,
    default: generatePublicId,
  },
  clientId: { type: String, required: true },
  customerId: { type: String },
  clientUserId: { type: String },
  message: { type: String, required: true },
  isPreserved: { type: Boolean, required: true, default: false },
  isRead: { type: Boolean, required: true, default: false },
  created_by: { type: String },
  updated_by: { type: String },
  created_at: { type: String },
  updated_at: { type: String },
});

const MessageModel = mongoose.model("message", MessageSchema);

export default MessageModel;
