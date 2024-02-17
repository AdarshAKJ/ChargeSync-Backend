import express from "express";
// import { authenticateUser } from "../../middleware/authorization";
import { deleteClient, listClient } from "./get";
import { createClient, updateClient } from "./post";
import { onlyAdmin } from "../../middleware/onlyAdmin";

const clientRouter = express.Router();

clientRouter.post("/create", onlyAdmin, createClient); // DONE

clientRouter.get("/list", listClient);
clientRouter.get("/delete/:id", deleteClient);
clientRouter.post("/update/:id", updateClient);

export default clientRouter;
