import express from "express";
import { listUnreadMessagesHandler, readUpdateMessageHandler } from "./get";
import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";
import { addMessage } from "./post";

const messageRouter = express.Router();

messageRouter.get(
  "/list-message",
  onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),
  listUnreadMessagesHandler
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
