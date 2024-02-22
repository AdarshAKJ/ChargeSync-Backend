import express from "express";

import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";
import {
  createChargerHandler,
  getSerialNumberHandler,
  updateChargerHandler,
  deleteChargerHandler,
  getChargerCountHandler,
  listChargerHandler,
  singleChargerHandler,
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

// update
chargerRouter.post(
  "/update/:id",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  updateChargerHandler
);

// delete
chargerRouter.post(
  "/delete/:id",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  deleteChargerHandler
); // Done

// list filter by status by station and pagination
chargerRouter.post(
  "/list",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  listChargerHandler
); // Done

// single charger.
chargerRouter.post(
  "/single-charger/:id",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  singleChargerHandler
); // DONE

// get charging count
chargerRouter.post(
  "/charging-count",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  getChargerCountHandler
); // DONE

export default chargerRouter;
