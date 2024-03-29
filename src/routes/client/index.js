import express from "express";
import { deleteClient, getSingleClientHandler, listClient } from "./get";
import { createClient, getClientSelectHandler, updateClient } from "./post";
import { onlyAdmin } from "../../middleware/onlyAdmin";

const clientRouter = express.Router();

clientRouter.post("/create", onlyAdmin, createClient); // DONE
clientRouter.get("/list", onlyAdmin, listClient);
clientRouter.get("/delete/:id", onlyAdmin, deleteClient);
clientRouter.post("/update/:id", onlyAdmin, updateClient);
clientRouter.get("/single-client/:id", onlyAdmin, getSingleClientHandler);
clientRouter.get("/select-client", onlyAdmin, getClientSelectHandler);

export default clientRouter;
