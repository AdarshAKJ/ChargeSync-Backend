import { getCurrentUnix } from "../../commons/common-functions";
import MessageModel from "../../models/messages";

export const sendNotification = async (
  title,
  msg,
  clientId,
  customerId,
  clientUserId,
  isPreserved
) => {
  try {
    await MessageModel.create({
      title,
      clientId: clientId,
      customerId: customerId,
      clientUserId: clientUserId,
      message: msg,
      isPreserved,
      created_at: getCurrentUnix(),
    });
  } catch (e) {
    console.log(e);
  }
};
