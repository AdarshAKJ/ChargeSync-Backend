import express from "express";
// import { authenticateUser } from "../../middleware/authorization";
import { deleteClientUser, listClientUser } from "./get";
import { createClientUser, loginClientUser, updateClientUser } from "./post";
import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";

const clientUserRouter = express.Router();

clientUserRouter.post("/login", loginClientUser); // DONE

clientUserRouter.post(
  "/create",
  onlyAdminAndClientWithRoles(["ADMIN"]),
  createClientUser
); // DONE

clientUserRouter.get("/list", listClientUser);
clientUserRouter.post("/update/:id", updateClientUser);
clientUserRouter.get("/delete/:id", deleteClientUser);

export default clientUserRouter;
