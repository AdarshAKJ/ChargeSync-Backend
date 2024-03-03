// List Admin
import { ValidationError } from "joi";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "../../helpers/custome.error";
import AdminModel from "../../models/admin";
import { responseGenerators } from "../../lib/utils";

export const listAdminHandler = async (req, res) => {
  try {
    let where = { isDeleted: false };

    let updatedData = await AdminModel.find(where);

    return res
      .status(StatusCodes.OK)
      .send(responseGenerators(updatedData, StatusCodes.OK, "SUCCESS", 0));
  } catch (error) {
    if (error instanceof ValidationError || error instanceof CustomError) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(
          responseGenerators({}, StatusCodes.BAD_REQUEST, error.message, 1)
        );
    }
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

export const infoAdminHandler = async (req, res) => {
  try {
    if (!req.params.id) throw new CustomError(`Please provide valid id`);

    const isAvailable = await AdminModel.findOne(
      { isDeleted: false, id: req.params.id },
      { password: 0 }
    )
      .lean()
      .exec();

    if (!isAvailable) throw new CustomError(`Admin doesn't exist`);

    return res
      .status(StatusCodes.OK)
      .send(responseGenerators(isAvailable, StatusCodes.OK, "SUCCESS", 0));
  } catch (error) {
    if (error instanceof ValidationError || error instanceof CustomError) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(
          responseGenerators({}, StatusCodes.BAD_REQUEST, error.message, 1)
        );
    }
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
