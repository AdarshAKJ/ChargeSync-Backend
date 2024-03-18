import express from "express";
import {
  listPreservedMessagesHandler,
  listUnreadMessagesHandler,
  readUpdateMessageHandler,
} from "./get";
import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";
import { addMessage } from "./post";

const messageRouter = express.Router();

messageRouter.post(
  "/list-message",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  listUnreadMessagesHandler
);

messageRouter.post(
  "/list-preserved-message",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  listPreservedMessagesHandler
);

messageRouter.post(
  "/read-update-message",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  readUpdateMessageHandler
);

//Add Dummy Messages to DataBase
messageRouter.post(
  "/add-message",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  addMessage
);

export default messageRouter;
