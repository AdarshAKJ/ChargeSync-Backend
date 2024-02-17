import { StatusCodes } from "http-status-codes";
import { responseGenerators } from "../lib/utils";
import { decryptData } from "../commons/common-functions";
import { verifyJwt } from "../helpers/Jwt.helper";
import AdminModel from "../models/admin";
import { TokenExpiredError } from "jsonwebtoken";
import { ERROR } from "../commons/global-constants";

export const onlyAdmin = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .send(
          responseGenerators(
            {},
            StatusCodes.UNAUTHORIZED,
            `Only  Admin can access this`,
            1
          )
        );
    } else {
      let jwtToken = decryptData(authorization);
      if (!jwtToken) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .send(
            responseGenerators(
              {},
              StatusCodes.UNAUTHORIZED,
              `Only  Admin can access this`,
              1
            )
          );
      }
      const jwtData = await verifyJwt(jwtToken);

      let adminData = await AdminModel.findOne({ _id: jwtData.id })
        .lean()
        .exec();
      if (!adminData) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .send(
            responseGenerators(
              {},
              StatusCodes.UNAUTHORIZED,
              `Only Admin can access this`,
              1
            )
          );
      }
      req.session = adminData;
      next();
    }
  } catch (error) {
    // JWT verification failed, return unauthorized response
    if (error instanceof TokenExpiredError) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .send(
          responseGenerators(
            {},
            StatusCodes.UNAUTHORIZED,
            `Token is expired`,
            1
          )
        );
    }
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .send(
        responseGenerators(
          {},
          StatusCodes.UNAUTHORIZED,
          ERROR.PROVIDE_TOKEN_ERROR,
          1
        )
      );
  }
};
