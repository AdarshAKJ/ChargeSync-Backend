import express from "express";

import {
  createChargerStationHandler,
  deleteChargerStationHandler,
  updateChargerStationHandler,
} from "./post";
import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";
import {
  getChargerStationCountHandler,
  listChargerStationHandler,
  singleChargerStationHandler,
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
chargerStationRouter.post(
  "/delete/:id",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  deleteChargerStationHandler
); // DONE

// single charger.
chargerStationRouter.get(
  "/single-chargingStation/:id",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  singleChargerStationHandler
); // DONE

// get chargingStation count
chargerStationRouter.get(
  "/chargingStation-count",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  getChargerStationCountHandler
); // DONE

export default chargerStationRouter;
