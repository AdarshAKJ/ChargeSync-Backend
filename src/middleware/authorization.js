import { StatusCodes } from "http-status-codes";
import { ERROR } from "../commons/global-constants";
import { verifyJwt } from "../helpers/Jwt.helper";
import { logsErrorAndUrl, responseGenerators } from "../lib/utils";
import TeamUserModel from "../models/clientUser";
import { TokenExpiredError } from "jsonwebtoken";
import AdminUserModel from "../models/admin";
// import { CustomError } from "../helpers/custome.error";

export const authenticateUser = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
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
    // Verify JWT token
    const tokenData = await verifyJwt(authorization);
    // if(!tokenData.payment_status || tokenData.payment_status !=='ACTIVE') throw new CustomError('Error, please complete the payment request first')
    req.session = tokenData;
    if (req.session.is_central_user) {
      // Check if user exists in the admin model based on the UID from the token
      let user = await AdminUserModel.findOne({
        _id: tokenData._id,
        token: authorization,
      });

      if (!user) {
        // User does not exist, return unauthorized response
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .send(
            responseGenerators(
              {},
              StatusCodes.UNAUTHORIZED,
              ERROR.TOKEN_EXPIRED,
              1
            )
          );
      }
      // User token and user are valid, continue to the next middleware
      next();
    } else {
      // Check if user exists in the user team model based on the UID from the token
      let user = await TeamUserModel.findOne({
        _id: tokenData._id,
        token: authorization,
      });

      if (!user) {
        // User does not exist, return unauthorized response
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .send(
            responseGenerators(
              {},
              StatusCodes.UNAUTHORIZED,
              ERROR.TOKEN_EXPIRED,
              1
            )
          );
      }
      // User token and user are valid, continue to the next middleware
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

export const checkAuthorizeOrSsoToken = async (req, res, next) => {
  const { authorization } = req.headers;
  // check toke is there
  if (!authorization) {
    // if token is not there then check ssoTOken is there or not.
    if (req.query.ssoToken) {
      req.isSSO = true;
      next();
    } else {
      // if both are not there then no access.
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
  } else {
    try {
      const tokenData = await verifyJwt(authorization);
      req.session = tokenData;
      next();
    } catch (error) {
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
    }
  }
};
