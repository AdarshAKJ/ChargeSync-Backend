import { StatusCodes } from "http-status-codes";
import { ValidationError } from "joi";
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
import ClientUserModel from "../../models/clientUser";
import { getJwt } from "../../helpers/Jwt.helper";
import { checkClientIdAccess } from "../../middleware/checkClientIdAccess";

export const createClientUser = async (req, res) => {
  try {
    await createClientUserValidation.validateAsync({ ...req.body });
    checkClientIdAccess(req.session, req.body.clientId);
    const isAvailable = await ClientUserModel.findOne({
      $or: [
        {
          phoneNumber: req.body.phoneNumber,
          clientId: req.body.clientId,
          isDeleted: false,
        },

        {
          email: req.body.email.toLowerCase(),
          clientId: req.body.clientId,
          isDeleted: false,
        },
      ],
    })
      .lean()
      .exec();

    if (isAvailable)
      throw new CustomError(
        `The user you are trying to create is already registered with given Email or Phone Number.`
      );

    let data = {
      ...req.body,
      email: req.body.email.toLowerCase(),
      password: await hashPassword(req.body.password),
      created_at: getCurrentUnix(),
      updated_at: getCurrentUnix(),
      updated_by: req.session._id,
      created_by: req.session._id,
    };

    const clientUser = await ClientUserModel.create(data);

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
    checkClientIdAccess(req.session, req.body.clientId);

    const userId = req.params.id;

    const user = await ClientUserModel.findOne({
      _id: userId,
      phoneNumber: req.body.phoneNumber,
      email: req.body.email,
      isDeleted: false,
      clientId: req.session.clientId || req.body.clientId,
    });

    if (!user)
      throw new CustomError(
        `The user you are trying to update is deleted or does not exist.`
      );

    let keys = [];
    for (let key in req.body) {
      keys.push(key);
    }

    for (let i = 0; i < keys.length; ++i) {
      user[keys[i]] = req.body[keys[i]];
    }

    user.updated_at = getCurrentUnix();
    user.updated_by = req.session._id;

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
    let loginData = await ClientUserModel.findOne({
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
    let jswToken = await getJwt({
      id: loginDataRaw._id,
      clientId: loginData.clientId,
      role: loginData.roleId,
    });

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          token: encryptData(jswToken),
          userData: loginDataRaw,
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

export const getSingleClientUser = async (req, res) => {
  try {
    let clientId = req?.session?.clientId ||req?.body?.clientId
    checkClientIdAccess(req.session, clientId);
    const { id } = req.params;

    const clientUser = await ClientUserModel.findOne({
      _id: id,
      clientId: clientId,
      isDeleted: false
    }).select("-password");

    if (!clientUser) {
      throw new CustomError("Client user not found");
    }

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        clientUser,
        StatusCodes.OK,
        "SUCCESS",
        0
      ))
  } catch (error) {
    if (error instanceof ValidationError || error instanceof CustomError) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(responseGenerators({}, StatusCodes.BAD_REQUEST, error.message, 1));
    }
    console.log(JSON.stringify(error));
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(responseGenerators({}, StatusCodes.INTERNAL_SERVER_ERROR, "Internal Server Error", 1));
  }
};
