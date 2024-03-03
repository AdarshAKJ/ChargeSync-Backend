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
  title: { type: String, required: true },
  message: { type: String, required: true },
  isPreserved: { type: Boolean, required: true, default: false },
  isRead: { type: Boolean, required: true, default: false },
  created_at: { type: String, required: true },
  updated_at: { type: String, required: true },
});

const MessageModel = mongoose.model("message", MessageSchema);

export default MessageModel;
