import express from "express";
import {
  createClientUser,
  loginClientUser,
  updateClientUser,
  deleteClientUser,
  listClientUser,
} from "./post";
import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";
import { getSingleClientUser } from "./get";

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

clientUserRouter.post(
  "/list",
  onlyAdminAndClientWithRoles(["ADMIN"]),
  listClientUser
); //DONE

clientUserRouter.post(
  "/update/:id",
  onlyAdminAndClientWithRoles(["ADMIN"]),
  updateClientUser
); //DONE

clientUserRouter.post(
  "/delete/:id",
  onlyAdminAndClientWithRoles(["ADMIN"]),
  deleteClientUser
); //DONE

export default clientUserRouter;
