import express from "express";
// import { authenticateUser } from "../../middleware/authorization";
import { deleteClientUser,listClientUser } from "./get";
import { createClientUser, getSingleClientUser, loginClientUser, updateClientUser } from "./post";
import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";

const clientUserRouter = express.Router();

clientUserRouter.post("/login", loginClientUser); // DONE

clientUserRouter.post(
  "/create",
  onlyAdminAndClientWithRoles(["ADMIN"]),
  createClientUser
); // DONE

clientUserRouter.post(
  "/single-client-user/:id",
  onlyAdminAndClientWithRoles(["ADMIN"]),
  getSingleClientUser
); //DONE

clientUserRouter.get(
  "/list",
  onlyAdminAndClientWithRoles(["ADMIN"]),
  listClientUser
); //DONE

clientUserRouter.post(
  "/update/:id",
  onlyAdminAndClientWithRoles(["ADMIN"]),
  updateClientUser
); //DONE

clientUserRouter.get(
  "/delete/:id",
  onlyAdminAndClientWithRoles(["ADMIN"]),
  deleteClientUser
); //DONE

export default clientUserRouter;
