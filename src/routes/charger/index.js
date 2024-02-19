import express from "express";

import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";
import {
  createChargerHandler,
  getSerialNumberHandler,
  updateChargerHandler,
} from "./post";
import {
  deleteChargerHandler,
  getChargerCountHandler,
  listChargerHandler,
  singleChargerHandler,
} from "./get";

const chargerRouter = express.Router();

chargerRouter.post(
  "/create",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  createChargerHandler
);

// check
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
chargerRouter.get(
  "/delete/:id",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  deleteChargerHandler
); // Done

// list filter by status by station and pagination
chargerRouter.get(
  "/list",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  listChargerHandler
); // Done

// single charger.
chargerRouter.get(
  "/single-charger/:id",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  singleChargerHandler
); // DONE

// get charging count
chargerRouter.get(
  "/charging-count",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  getChargerCountHandler
); // DONE

export default chargerRouter;
