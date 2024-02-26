import express from "express";
import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";
import {
  createVehicleHandler,
  listVehicleHandler,
  singleVehicleHandler,
  updateVehicleHandler,
} from "./post";

const vehicleRouter = express.Router();

vehicleRouter.post(
  "/create",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  createVehicleHandler
);
vehicleRouter.post(
  "/update/:id",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  updateVehicleHandler
);
vehicleRouter.post(
  "/list",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  listVehicleHandler
);
vehicleRouter.post(
  "/single-customer/:id",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  singleVehicleHandler
);

export default vehicleRouter;
