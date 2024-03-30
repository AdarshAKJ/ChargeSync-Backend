import express from "express";

import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";
import {
  chargerAvailableConnectorsHandler,
  chargerClientIdHandler,
  chargerOfflineOnlineHandler,
  createChargerHandler,
  deleteChargerHandler,
  getChargerCountHandler,
  getChargerSelectHandler,
  getClientDetailsBySerialNumberHandler,
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

// get-charger-select
chargerRouter.post(
  "/get-charger-select",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  getChargerSelectHandler
);

// available connector for charger
chargerRouter.post(
  "/charger-available-connectors",
  chargerAvailableConnectorsHandler
);

// Get Client Id by Serial Number
chargerRouter.post(
  "/charger-client-id",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  chargerClientIdHandler
);

// Check charger is online or offline.
chargerRouter.post(
  "/charger-offline-online",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  chargerOfflineOnlineHandler
);

/**
 *  get client details based on serial Number
 *  This API is used by APP to get client details
 */
chargerRouter.get(
  "/get-client-details-by-serial-number/:serialNumber",
  getClientDetailsBySerialNumberHandler
);

export default chargerRouter;
