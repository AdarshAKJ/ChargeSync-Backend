import express from "express";
import { authenticateUser } from "../../middleware/authorization";
import { deleteClient, listClient } from "./get";
import { createClient, loginClient, updateClient } from "./post";

const clientRouter = express.Router();

clientRouter.post("/login", loginClient);

// clientRouter.use(authenticateUser);
clientRouter.get("/list", listClient);
clientRouter.get("/delete/:id", deleteClient);
clientRouter.post("/create", createClient);
clientRouter.post("/update/:id", updateClient);

export default clientRouter;
