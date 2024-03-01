import express from "express";
import { authenticateCustomer } from "../../middleware/authenticateCustomer";
import { dashboard } from "./post";
const dashboardRouter = express.Router();

// For customers
dashboardRouter.post("/", authenticateCustomer, dashboard);

export default dashboardRouter;
