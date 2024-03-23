import express from "express";
import {
  createVehicleHandler,
  listVehicleHandler,
  singleVehicleHandler,
  updateVehicleHandler,
} from "./post";
import { authenticateCustomer } from "../../middleware/authenticateCustomer";
import { deleteVehicleHandler } from "./get";

const vehicleRouter = express.Router();

vehicleRouter.post("/create", authenticateCustomer, createVehicleHandler);
vehicleRouter.post("/update/:id", authenticateCustomer, updateVehicleHandler);
vehicleRouter.post("/list", authenticateCustomer, listVehicleHandler);
vehicleRouter.post(
  "/single-vehicle/:id",
  authenticateCustomer,
  singleVehicleHandler
);

vehicleRouter.get("/delete/:id", authenticateCustomer, deleteVehicleHandler);

export default vehicleRouter;
