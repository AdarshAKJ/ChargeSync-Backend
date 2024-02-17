import express from "express";

import { createChargerStationHandler } from "./post";
import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";

const chargerStationRouter = express.Router();

chargerStationRouter.post(
  "/create",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  createChargerStationHandler
); // DONE

// update
// delete
// list
// single charger.

// get chargingStation count

export default chargerStationRouter;
