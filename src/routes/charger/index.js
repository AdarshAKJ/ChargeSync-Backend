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
chargerRouter.post(
  "/list",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"])
  // listChargerHandler
); // Done

//single charger
chargerRouter.post(
  "/single-charger/:id",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"])
  // singleChargerHandler
); // DONE

// get charging count
chargerRouter.post(
  "/charging-count",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"])
  // getChargerCountHandler
); // DONE

export default chargerRouter;
