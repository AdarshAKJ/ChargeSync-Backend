import { CustomError } from "../helpers/custome.error";

export const checkClientIdAccess = (session, clientId) => {
  if (session && session?.superAdmin) {
    return true;
  } else if (session && !session.superAdmin) {
    if (session.clientId !== clientId)
      throw new CustomError(`Access to ${session.clientId} denied`);
    else return true;
  } else {
    throw new CustomError(`Access to ${session.clientId} denied`);
  }
};
