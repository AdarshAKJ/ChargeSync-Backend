import express from "express";

import { createChargerStationHandler } from "./post";
import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";
import { listChargerStationHandler } from "./get";

const chargerStationRouter = express.Router();

chargerStationRouter.post(
  "/create",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  createChargerStationHandler
); // DONE

chargerStationRouter.get(
  "/list",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  listChargerStationHandler
); // DONE

// update
// delete
// list
// single charger.

// get chargingStation count

export default chargerStationRouter;
