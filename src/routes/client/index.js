import express from "express";
import { deleteClient, listClient } from "./get";
import { createClient, getSingleClientHandler, updateClient } from "./post";
import { onlyAdmin } from "../../middleware/onlyAdmin";

const clientRouter = express.Router();

clientRouter.post("/create", onlyAdmin, createClient); // DONE

clientRouter.get("/list", onlyAdmin, listClient);
clientRouter.get("/delete/:id", onlyAdmin, deleteClient);
clientRouter.post("/update/:id", onlyAdmin, updateClient);
clientRouter.post("/single-client/:id", onlyAdmin, getSingleClientHandler);

export default clientRouter;
