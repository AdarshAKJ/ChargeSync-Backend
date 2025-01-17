import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    trim: true,
  },
  occpTransactionId: { type: String, required: true },
  clientId: { type: String, required: true, trim: true }, //database
  customerId: { type: String, required: true },
  stationId: { type: String, required: true },
  walletTransactionId: { type: String },
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
      "Interrupted",
    ],
    default: "Pending",
  },
  vehicleId: { type: String, required: true },
  perUnitCharges: { type: Number, required: true },
  startMeterReading: { type: Number }, //in "Wh"
  expectedEndMeterReading: { type: Number }, // this is expected meter reading where charger should stop.
  endMeterReading: { type: Number },
  amount: { type: Number },
  tax: { type: Number },
  totalCost: { type: Number },
  initialDeduction: { type: Number },
  failedReason: { type: String, trim: true },
  customerReason: { type: String, trim: true },
  requestedWatts: { type: Number }, // this is requested by user
  requiredTime: { type: Number },
  idTag: { type: String, trim: true, index: true },
  currentMeterReading: { type: Number }, // this we use to calculate the required time for charging
  currentMeterReadingTime: { type: String },
  requestInput: {
    type: String,
    trim: true,
    enum: ["WATT", "TIME"],
    default: "WATT",
  },
  created_by: { type: String },
  updated_by: { type: String },
  created_at: { type: String },
  updated_at: { type: String },
});

const TransactionModel = mongoose.model("transaction", TransactionSchema);

export default TransactionModel;
