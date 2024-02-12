import express from "express";
import { authenticateUser } from "../../middleware/authorization";
import { deleteClient, listClient } from "./get";
import { createClient, updateClient } from "./post";

const clientRouter = express.Router();

clientRouter.use(authenticateUser);

clientRouter.get("/list", listClient);
clientRouter.get("/delete", deleteClient);
clientRouter.post("/create", createClient);
clientRouter.post("/update", updateClient);

export default clientRouter;
