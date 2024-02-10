import express from "express";
import { listClientUser } from "./get";
import { createClientUser, updateClientUser } from "./post";

const clientUserRouter = express.Router();

clientUserRouter.post("/create", createClientUser);
clientUserRouter.post("/update/:id", updateClientUser);
clientUserRouter.get("/list", listClientUser);

export default clientUserRouter;
