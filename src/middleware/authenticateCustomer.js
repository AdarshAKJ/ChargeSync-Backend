import { StatusCodes } from "http-status-codes";
import { ERROR } from "../commons/global-constants";
import { verifyJwt } from "../helpers/Jwt.helper";
import { responseGenerators } from "../lib/utils";
import { TokenExpiredError } from "jsonwebtoken";
import CustomerModel from "../models/customer";
import { decryptData } from "../commons/common-functions";

export const authenticateCustomer = async (req, res, next) => {
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
    // decryptData authorization
    let jwtToken = decryptData(authorization);
    if (!jwtToken) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .send(
          responseGenerators({}, StatusCodes.UNAUTHORIZED, `Access denied`, 1)
        );
    }
    // Verify JWT token
    const tokenData = await verifyJwt(jwtToken);

    let user = await CustomerModel.findOne({
      _id: tokenData.id,
      isVerified: true,
    })
      .lean()
      .exec();

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
    req.session = user;
    next();
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
