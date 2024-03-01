import mongoose from "mongoose";
import { generatePublicId } from "../commons/common-functions";

const ChargerConnectorSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    trim: true,
    default: generatePublicId,
  },
  clientId: { type: String, required: true, trim: true },
  stationId: { type: String, required: true },
  chargerId: { type: String, required: true },
  connectorId: { type: String, required: true },
  connectorType: { type: String, required: true },
  pricePerUnit: { type: Number, required: true }, // kwH
  status: {
    type: String,
    required: true,
    enum: [
      "Available",
      "Preparing",
      "Charging",
      "SuspendedEVSE",
      "SuspendedEV",
      "Finishing",
      "Reserved",
      "Unavailable",
      "Faulted",
      "Ready",
    ],
    default: "Ready",
  },
  errorCode: {
    type: String,
    required: true,
    enum: [
      "ConnectorLockFailure",
      "EVCommunicationError",
      "GroundFailure",
      "HighTemperature",
      "InternalError",
      "LocalListConflict",
      "NoError",
      "OtherError",
      "OverCurrentFailure",
      "PowerMeterFailure",
      "PowerSwitchFailure",
      "ReaderFailure",
      "ResetFailure",
      "UnderVoltage",
      "OverVoltage",
      "WeakSignal",
    ],
    default: "NoError",
  },
  created_by: { type: String },
  updated_by: { type: String },
  created_at: { type: String },
  updated_at: { type: String },
  isDeleted: { type: Boolean, default: false },
});

const ChargerConnectorModel = mongoose.model(
  "charger-connector",
  ChargerConnectorSchema
);

export default ChargerConnectorModel;
