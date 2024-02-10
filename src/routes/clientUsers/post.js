import { StatusCodes } from "http-status-codes";
import { ValidationError } from "webpack";
import { getCurrentUnix, hashPassword } from "../../commons/common-functions";
import { CustomError } from "../../helpers/custome.error";
import {
  createClientUserValidation,
  updateClientUserValidation,
} from "../../helpers/validations/client.uservalidation";
import { responseGenerators } from "../../lib/utils";
import clientUserModel from "../../models/clientUser";

export const createClientUser = async (req, res) => {
  try {
    await createClientUserValidation.validateAsync({ ...req.body });
    const isAvailable = await clientUserModel
      .findOne({
        $and: [{ email: req.body.email }, { clientId: req.body.clientId }],
      })
      .lean()
      .exec();

    if (isAvailable) throw new CustomError(`User already exists.`);

    let data = {
      ...req.body,
      password: await hashPassword(req.body.password),
      created_at: getCurrentUnix(),
      updated_at: getCurrentUnix(),
      updated_by: req.clientId,
      created_by: req.clientId,
    };

    const clientUser = await clientUserModel.create(data);
    if (!clientUser) throw new CustomError(`User could not be created.`);

    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators(
          { ...clientUser.toJSON() },
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

export const updateClientUser = async (req, res) => {
  try {
    await updateClientUserValidation.validateAsync({
      ...req.body,
      ...req.params,
    });
    const userId = req.params.id;
    const user = await clientUserModel.findOne({
      _id: userId,
    });

    if (!user) throw new CustomError(`User does not exists.`);

    let keys = [];
    for (let key in req.body) {
      if (key === "_id") continue;
      keys.push(key);
    }

    for (let i = 0; i < keys.length; ++i) {
      user[keys[i]] = req.body[keys[i]];
    }

    await user.save();
    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators({ ...user.toJSON() }, StatusCodes.OK, "SUCCESS", 0)
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
