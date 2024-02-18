import express from "express";

import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";
import {
  createChargerHandler,
  getSerialNumberHandler,
  updateChargerHandler,
} from "./post";

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

chargerRouter.post(
  "/update:id",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  updateChargerHandler
);

// update post
// delete get
// list filter by status by station and pagination
// single charger.
// get charging count

export default chargerRouter;
