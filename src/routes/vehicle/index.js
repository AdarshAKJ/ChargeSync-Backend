import express from "express";
import {
  createVehicleHandler,
  listVehicleHandler,
  singleVehicleHandler,
  updateVehicleHandler,
} from "./post";
import { authenticateCustomer } from "../../middleware/authenticateCustomer";

const vehicleRouter = express.Router();

vehicleRouter.post("/create", authenticateCustomer, createVehicleHandler);
vehicleRouter.post("/update/:id", authenticateCustomer, updateVehicleHandler);
vehicleRouter.post("/list", authenticateCustomer, listVehicleHandler);
vehicleRouter.post(
  "/single-customer/:id",
  authenticateCustomer,
  singleVehicleHandler
);

export default vehicleRouter;
