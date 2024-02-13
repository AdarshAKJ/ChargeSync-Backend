import { StatusCodes } from "http-status-codes";
import { ValidationError } from "webpack";
import {
  comparePassword,
  encryptData,
  getCurrentUnix,
  hashPassword,
} from "../../commons/common-functions";
import { CustomError } from "../../helpers/custome.error";
import {
  createClientUserValidation,
  loginClientUserValidation,
  updateClientUserValidation,
} from "../../helpers/validations/client.user.validation";
import { responseGenerators } from "../../lib/utils";
import clientUserModel from "../../models/clientUser";
import { getJwt } from "../../helpers/Jwt.helper";

export const createClientUser = async (req, res) => {
  try {
    await createClientUserValidation.validateAsync({ ...req.body });
    const isAvailable = await clientUserModel
      .findOne({
        $and: [
          { email: req.body.email },
          { clientId: req.body.clientId },
          { isDeleted: false },
        ],
      })
      .lean()
      .exec();

    if (isAvailable)
      throw new CustomError(
        `The user you are trying to create is already registered.`
      );

    let data = {
      ...req.body,
      password: await hashPassword(req.body.password),
      created_at: getCurrentUnix(),
      updated_at: getCurrentUnix(),
      updated_by: req.clientId,
      created_by: req.clientId,
    };

    const clientUser = await clientUserModel.create(data);

    if (!clientUser)
      throw new CustomError(
        `We are encountering some errors from our side. Please try again later.`
      );

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
      isDeleted: false,
    });

    if (!user)
      throw new CustomError(
        `The user you are trying to update is deleted or does not exist.`
      );

    // any key handling that cannot be updated should be handled here i.e. email, contact
    // if(req.body.email) throw new CustomError(`email cannot be updated.`);

    let keys = [];
    for (let key in req.body) {
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

export const loginClientUser = async (req, res) => {
  try {
    await loginClientUserValidation.validateAsync(req.body);
    let loginData = await clientUserModel.findOne({
      email: req.body.email.toLowerCase(),
      isDeleted: false,
    });

    if (!loginData) throw new CustomError(`Invalid email or password.`);

    let isPasswordMatched = await comparePassword(
      req.body.password,
      loginData.password
    );
    if (!isPasswordMatched) throw new CustomError(`Invalid email or password.`);

    let loginDataRaw = loginData.toJSON();
    loginData.lastLogin = getCurrentUnix();
    loginData.save();

    delete loginDataRaw.password;
    let jswToken = await getJwt({ id: loginDataRaw._id });

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          token: encryptData(jswToken),
          userData: loginData,
          loginCompleted: true,
        },
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
