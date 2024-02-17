import { StatusCodes } from "http-status-codes";
import { responseGenerators } from "../lib/utils";
import { decryptData } from "../commons/common-functions";
import { verifyJwt } from "../helpers/Jwt.helper";
import AdminModel from "../models/admin";
import { TokenExpiredError } from "jsonwebtoken";
import { ERROR } from "../commons/global-constants";
import ClientUserModel from "../models/clientUser";

export const onlyAdminAndClientWithRoles = (roles) => {
  return async (req, res, next) => {
    try {
      const { authorization } = req.headers;
      if (!authorization) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .send(
            responseGenerators({}, StatusCodes.UNAUTHORIZED, `Access denied`, 1)
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
                `Access denied`,
                1
              )
            );
        }
        const jwtData = await verifyJwt(jwtToken);

        // FOR SUPPER ADMIN
        if (jwtData.superAdmin) {
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
                  `Access denied`,
                  1
                )
              );
          }
          req.session = { superAdmin: true, ...adminData };
          next();
        } else {
          // FOR CLIENT.
          if (!Array.isArray(roles) || !roles.length) {
            return res
              .status(StatusCodes.UNAUTHORIZED)
              .send(
                responseGenerators(
                  {},
                  StatusCodes.INTERNAL_SERVER_ERROR,
                  `Something went wrong`,
                  1
                )
              );
          }

          // if its client then only client admin.
          let clientData = await ClientUserModel.findOne({
            _id: jwtData.id,
            roleId: { $in: roles },
          })
            .lean()
            .exec();
          if (!clientData) {
            return res
              .status(StatusCodes.UNAUTHORIZED)
              .send(
                responseGenerators(
                  {},
                  StatusCodes.UNAUTHORIZED,
                  `Access denied`,
                  1
                )
              );
          }
          req.session = { superAdmin: false, ...clientData };
          next();
        }
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
};
