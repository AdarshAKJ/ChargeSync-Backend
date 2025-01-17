import { StatusCodes } from "http-status-codes";
import { ValidationError } from "joi";
import jwt from "jsonwebtoken";
import {
  comparePassword,
  encryptData,
  getCurrentUnix,
  hashPassword,
  setPagination,
} from "../../commons/common-functions";
import { CustomError } from "../../helpers/custome.error";
import {
  clientUserForgotPasswordValidation,
  clientUserResetPasswordValidation,
  createClientUserValidation,
  deleteClientUserValidation,
  listClientUserValidation,
  loginClientUserValidation,
  updateClientUserValidation,
} from "../../helpers/validations/client.user.validation";
import { responseGenerators } from "../../lib/utils";
import ClientUserModel from "../../models/clientUser";
import { getJwt } from "../../helpers/Jwt.helper";
import { checkClientIdAccess } from "../../middleware/checkClientIdAccess";
import configVariables from "../../../config";
import { hashSync } from "bcryptjs";

export const createClientUser = async (req, res) => {
  try {
    await createClientUserValidation.validateAsync({ ...req.body });
    checkClientIdAccess(req.session, req.body.clientId);
    let isAdminCreated = req.session.superAdmin ? true : false;

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
        `user already exist with given Email or Phone Number.`
      );

    let data = {
      ...req.body,
      email: req.body.email.toLowerCase(),
      password: await hashPassword(req.body.password),
      isAdminCreated: isAdminCreated,
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

    let isDuplicateEmail = await ClientUserModel.findOne({
      _id: { $ne: userId },
      email: req.body.email,
      isDeleted: false,
      clientId: req.session.clientId || req.body.clientId,
    });

    if (isDuplicateEmail) throw new CustomError(`Email already  exists`);

    const user = await ClientUserModel.findOne({
      _id: userId,
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

export const deleteClientUser = async (req, res) => {
  try {
    await deleteClientUserValidation.validateAsync({
      ...req.body,
      ...req.params,
    });
    const { id: userId } = req.params;
    let clientId = req.session.clientId || req.query.clientId;
    checkClientIdAccess(req.session, req.body.clientId);

    const user = await ClientUserModel.findOne({
      _id: userId,
      clientId: clientId,
      isDeleted: false,
    });

    if (!user) throw new CustomError(`No such user is registered with us.`);

    if (user.isAdminCreated) throw new CustomError(`Admin can not be deleted`);
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

export const listClientUser = async (req, res) => {
  try {
    await listClientUserValidation.validateAsync(req.body);

    let where = {
      isDeleted: false,
      clientId: req.session.clientId || req.body.clientId,
    };

    checkClientIdAccess(req.session, where.clientId);

    if (req.query?.search) {
      where = {
        ...where,
        ...{
          $or: [
            { fname: new RegExp(req.query?.search.toString(), "i") },
            { lname: new RegExp(req.query?.search.toString(), "i") },
            { email: new RegExp(req.query?.search.toString(), "i") },
          ],
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
      .select("-password")
      .sort(pagination.sort)
      .skip(pagination.offset)
      .limit(pagination.limit);

    delete users[0].password;

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

/** FORGET Password API for ClientUser */
export const forgetPasswordHandler = async (req, res) => {
  try {
    await clientUserForgotPasswordValidation.validateAsync(req.body);
    
    const clientUser = await ClientUserModel.findOne({
      email: req.body.email.toLowerCase(),
    });

    if (!clientUser) {
      throw new CustomError("User with this email address does not exist");
    }

    const token = jwt.sign(
      { clientUserId: clientUser._id },
      configVariables.JWT_SECRET_KEY,
      { expiresIn: "5m" }
    );

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          token,
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


/** RESET Password API for ClientUser */
export const resetPasswordHandler = async (req, res) => {
  try {
    await clientUserResetPasswordValidation.validateAsync(req.body);
    const { token, new_password, compare_password } = req.body;

    if (!token) {
      throw new CustomError("Token is missing");
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, configVariables.JWT_SECRET_KEY);
    } catch (error) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Invalid token" });
    }

    const _id = decodedToken.clientUserId;

    const clientUser = await ClientUserModel.findById(_id);

    if (!clientUser) {
      throw new CustomError("User with this clientUser ID does not exist");
    }

    if (new_password !== compare_password) {
      throw new CustomError("New password and compare password do not match");
    }

    const hashedPassword = hashSync(new_password, 10);

    await ClientUserModel.findByIdAndUpdate(clientUser._id, {
      password: hashedPassword,
    });

    return res
      .status(StatusCodes.OK)
      .send(responseGenerators(StatusCodes.OK, "SUCCESS", 0));
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
