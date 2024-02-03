import { StatusCodes } from "http-status-codes";
import { responseGenerators } from "../lib/utils";

export const onlyAdmin = async (req, res, next) => {
  if (!req.tokenData.is_central_user) {
    return res
    .status(StatusCodes.UNAUTHORIZED)
    .send(
      responseGenerators(
        {},
        StatusCodes.UNAUTHORIZED,
         `Only Workspace Admin can access this`,
        1
      )
    );
  } else {
    next();
  }
};
