import express from "express";
import { deleteClient, listClient } from "./get";
import { createClient, updateClient } from "./post";
import { onlyAdmin } from "../../middleware/onlyAdmin";

const clientRouter = express.Router();

clientRouter.post("/create", onlyAdmin, createClient); // DONE

clientRouter.get("/list", onlyAdmin, listClient);
clientRouter.get("/delete/:id", onlyAdmin, deleteClient);
clientRouter.post("/update/:id", onlyAdmin, updateClient);

export default clientRouter;
