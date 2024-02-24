import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    trim: true,
  },
  clientId: { type: String, required: true, trim: true }, //database
  serialNumber: { type: String, required: true }, //database
  connectorId: { type: String, required: true }, //database
  status: {
    type: String,
    required: true,
    enum: [
      "Pending",
      "Accepted",
      "InProgress",
      "Blocked",
      "Expired",
      "Invalid",
      "ConcurrentTx",
      "Completed",
      "Failed",
    ],
    default: "Pending",
  },
  vehicleId: { type: String, required: true },
  perUnitCharges: { type: Number, required: true },
  startMeterReading: { type: Number }, //in "Wh"
  endMeterReading: { type: Number },
  amount: { type: Number },
  tax: { type: Number },
  totalCost: { type: Number },
  failedReason: { type: String, trim: true },

  idTag: { type: String, trim: true, index: true },
  created_by: { type: String },
  updated_by: { type: String },
  created_at: { type: String },
  updated_at: { type: String },
});

const TransactionModel = mongoose.model("transaction", TransactionSchema);

export default TransactionModel;
