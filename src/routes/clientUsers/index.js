import express from "express";
import {
  createClientUser,
  loginClientUser,
  updateClientUser,
  deleteClientUser,
  listClientUser,
} from "./post";
import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";

const clientUserRouter = express.Router();

clientUserRouter.post("/login", loginClientUser); // DONE

clientUserRouter.post(
  "/create",
  onlyAdminAndClientWithRoles(["ADMIN"]),
  createClientUser
); // DONE

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
