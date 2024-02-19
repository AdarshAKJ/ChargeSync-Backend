import express from "express";

import {
  createChargerStationHandler,
  updateChargerStationHandler,
} from "./post";
import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";
import {
  deleteChargerStationHandler,
  getChargerStationCountHandler,
  listChargerStationHandler,
  single_chargerChargerStationHandler,
} from "./get";

const chargerStationRouter = express.Router();

chargerStationRouter.post(
  "/create",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  createChargerStationHandler
); // DONE

// list
chargerStationRouter.get(
  "/list",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  listChargerStationHandler
); // DONE

// update
chargerStationRouter.post(
  "/update/:id",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  updateChargerStationHandler
); // DONE

// delete
chargerStationRouter.get(
  "/delete/:id",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  deleteChargerStationHandler
); // DONE

// single charger.
chargerStationRouter.get(
  "/single-charger/:id",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  single_chargerChargerStationHandler
); // DONE

// get chargingStation count
chargerStationRouter.get(
  "/chargingStation-count",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  getChargerStationCountHandler
); // DONE

export default chargerStationRouter;
