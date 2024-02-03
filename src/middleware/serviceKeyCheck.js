import { StatusCodes } from "http-status-codes";
import { responseGenerators } from "../lib/utils";
import configVariables from "../../config";

export const serviceKeyCheck = async (req, res, next) => {
  const { apikey } = req.headers;
  console.log(configVariables.API_KEY)
  if (apikey !== configVariables.API_KEY) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .send(
        responseGenerators(
          {},
          StatusCodes.UNAUTHORIZED,
          `Please provide valid API key.`,
          1
        )
      );
  } else {
    next();
  }
};
