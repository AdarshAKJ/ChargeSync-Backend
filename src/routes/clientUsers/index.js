import express from "express";
import { authenticateUser } from "../../middleware/authorization";
import { deleteClientUser, listClientUser } from "./get";
import { createClientUser, updateClientUser } from "./post";

const clientUserRouter = express.Router();

clientUserRouter.use(authenticateUser);

clientUserRouter.post("/create", createClientUser);
clientUserRouter.get("/list", listClientUser);
clientUserRouter.post("/update/:id", updateClientUser);
clientUserRouter.get('/delete/:id', deleteClientUser);

export default clientUserRouter;
