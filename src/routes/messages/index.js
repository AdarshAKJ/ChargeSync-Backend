import express from "express";
import { listUnreadMessagesHandler, readUpdateMessageHandler } from "./get";
import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";

const messageRouter = express.Router();

messageRouter.post(
  "/list-message",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  listUnreadMessagesHandler
);

messageRouter.post(
  "/read-update-message",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  readUpdateMessageHandler
);

export default messageRouter;
