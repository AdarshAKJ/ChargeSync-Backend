import express from "express";
import {
  createClientUser,
  loginClientUser,
  updateClientUser,
  deleteClientUser,
  listClientUser,
  forgetPasswordHandler,
  resetPasswordHandler,
} from "./post";
import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";
import { getSingleClientUser } from "./get";

const clientUserRouter = express.Router();

clientUserRouter.post("/login", loginClientUser);

clientUserRouter.post(
  "/create",
  onlyAdminAndClientWithRoles(["ADMIN"]),
  createClientUser
);

clientUserRouter.post(
  "/single-client-user/:id",
  onlyAdminAndClientWithRoles(["ADMIN"]),
  getSingleClientUser
);

clientUserRouter.post(
  "/list",
  onlyAdminAndClientWithRoles(["ADMIN"]),
  listClientUser
);

clientUserRouter.post(
  "/update/:id",
  onlyAdminAndClientWithRoles(["ADMIN"]),
  updateClientUser
);

clientUserRouter.post(
  "/delete/:id",
  onlyAdminAndClientWithRoles(["ADMIN"]),
  deleteClientUser
);

clientUserRouter.post("/forgot-password", forgetPasswordHandler);

clientUserRouter.post("/reset-password", resetPasswordHandler);

export default clientUserRouter;
