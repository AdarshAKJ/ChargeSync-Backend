import express from "express";
import {listUnreadMessagesHandler, readUpdateMessageHandler} from "./get";
import { onlyAdminAndClientWithRoles } from "../../middleware/onlyClientAndAdmin";


const messageRouter = express.Router();



messageRouter.post("/readUpdateMessage", onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),readUpdateMessageHandler);
//messageRouter.put("/readmessage/:id",readMessageHandler);
messageRouter.get("/listMessage",onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]),listUnreadMessagesHandler);


export default messageRouter;
