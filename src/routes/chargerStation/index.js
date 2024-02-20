import express from "express";

import {
  createChargerStationHandler,
  deleteChargerStationHandler,
  updateChargerStationHandler,
  getChargerStationCountHandler,
  listChargerStationHandler,
  singleChargerStationHandler,
} from "./post";
import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";

const chargerStationRouter = express.Router();

// create
chargerStationRouter.post(
  "/create",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  createChargerStationHandler
); // DONE

// list
chargerStationRouter.post(
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
chargerStationRouter.post(
  "/single-chargingStation/:id",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  singleChargerStationHandler
); // DONE

// get chargingStation count
chargerStationRouter.post(
  "/chargingStation-count",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  getChargerStationCountHandler
); // DONE

export default chargerStationRouter;
