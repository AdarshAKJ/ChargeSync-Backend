import express from "express";

import { onlyAdmin } from "../../middleware/onlyAdmin";
import { createMaintenanceHandler } from "./post";

const maintenanceRouter = express.Router();

maintenanceRouter.post("/create", onlyAdmin, createMaintenanceHandler);

export default maintenanceRouter;
