import { StatusCodes } from "http-status-codes";
import { ValidationError } from "webpack";
import { CustomError } from "../../helpers/custome.error";
import { responseGenerators } from "../../lib/utils";
import ClientUserModel from "../../models/clientUser";
import { setPagination } from "../../commons/common-functions";
import { checkClientIdAccess } from "../../middleware/checkClientIdAccess";

export const listClientUser = async (req, res) => {
  try {
    let where = {
      isDeleted: false,
      clientId: req.session.clientId || req.query.clientId,
    };

    checkClientIdAccess(req.session, where.clientId);

    if (req.query?.search) {
      where = {
        ...where,
        ...{
          fname: new RegExp(req.query?.search.toString(), "i"),
          lname: new RegExp(req.query?.search.toString(), "i"),
          email: new RegExp(req.query?.search.toString(), "i"),
        },
      };
    }

    if (req.query?.role) {
      where = {
        ...where,
        ...{
          roleId: new RegExp(req.query?.role.toString(), "i"),
        },
      };
    }

    const pagination = setPagination(req.query);
    const users = await ClientUserModel.find(where)
      .sort(pagination.sort)
      .skip(pagination.offset)
      .limit(pagination.limit);

    if (!users) throw new CustomError(`No users found.`);
    let total_count = await ClientUserModel.count(where);

    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators(
          { paginatedData: users, totalCount: total_count },
          StatusCodes.OK,
          "SUCCESS",
          0
        )
      );
  } catch (error) {
    if (error instanceof ValidationError || error instanceof CustomError) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(
          responseGenerators({}, StatusCodes.BAD_REQUEST, error.message, 1)
        );
    }
    console.log(JSON.stringify(error));
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(
        responseGenerators(
          {},
          StatusCodes.INTERNAL_SERVER_ERROR,
          "Internal Server Error",
          1
        )
      );
  }
};

export const deleteClientUser = async (req, res) => {
  try {
    const { id: userId } = req.params;
    let clientId = req.session.clientId || req.query.clientId;
    checkClientIdAccess(req.session, clientId.clientId);

    const user = await ClientUserModel.findOne({
      _id: userId,
      clientId: clientId,
      isDeleted: false,
    });

    if (!user) throw new CustomError(`No such user is registered with us.`);

    user.isDeleted = true;

    await user.save();

    return res
      .status(StatusCodes.OK)
      .send(responseGenerators({}, StatusCodes.OK, "SUCCESS", 0));
  } catch (error) {
    if (error instanceof ValidationError || error instanceof CustomError) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(
          responseGenerators({}, StatusCodes.BAD_REQUEST, error.message, 1)
        );
    }
    console.log(JSON.stringify(error));
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(
        responseGenerators(
          {},
          StatusCodes.INTERNAL_SERVER_ERROR,
          "Internal Server Error",
          1
        )
      );
  }
};
