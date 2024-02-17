import express from "express";

import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";
import { createChargerHandler, getSerialNumberHandler } from "./post";

const chargerRouter = express.Router();

chargerRouter.post(
  "/create",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  createChargerHandler
);

chargerRouter.post(
  "/get-serial-number",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  getSerialNumberHandler
);

// update
// delete
// list filter by status by station and pagination
// single charger.
// get charging count

export default chargerRouter;
