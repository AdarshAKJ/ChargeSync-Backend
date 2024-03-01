import express from "express";

import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";
import {
  createChargerHandler,
  deleteChargerHandler,
  getChargerCountHandler,
  getSerialNumberHandler,
  listChargerHandler,
  singleChargerHandler,
  updateChargerHandler,
  updateConnectorPricePerUnitHandler,
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
  "/list",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  listChargerHandler
); // Done

//single charger
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

// delete
chargerRouter.post(
  "/delete/:id",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  deleteChargerHandler
); // DONE

// update
chargerRouter.post(
  "/update/:id",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  updateChargerHandler
);

// connector price update
chargerRouter.post(
  "/connector-price-update",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  updateConnectorPricePerUnitHandler
);

export default chargerRouter;
