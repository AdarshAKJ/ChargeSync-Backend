import express from "express";

import { onlyAdmin } from "../../middleware/onlyAdmin";
import { createMaintenanceHandler, updateMaintenanceHandler } from "./post";
import { listmaintenanceHandler } from "./get";

const maintenanceRouter = express.Router();

maintenanceRouter.post("/create", onlyAdmin, createMaintenanceHandler);
maintenanceRouter.post("/update/:id", onlyAdmin, updateMaintenanceHandler);

maintenanceRouter.get("/list",listmaintenanceHandler);



export default maintenanceRouter;

