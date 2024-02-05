import { ValidationError } from "webpack";
import {
  createAdminValidation,
  deleteAdminValidation,
  loginAdminValidation,
  loginMemberValidation,
  updateAdminValidation,
} from "../../helpers/validations/admin.user.validation";
import {
  comparePassword,
  getCurrentUnix,
  hashPassword,
  setPagination,
} from "../../commons/common-functions";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "../../helpers/custome.error";
import adminModel from "../../models/admin";
import { responseGenerators } from "../../lib/utils";
import { getJwt } from "../../helpers/Jwt.helper";

// Create Admin
export const createAdminHandler = async (req, res) => {
  try {
    await createAdminValidation.validateAsync(req.body);

    const isAvailable = await adminModel.findOne({
      isDeleted: false,
      email: req.body.email,
    });
    if (isAvailable)
      throw new CustomError(`Member with give details already exists`);

    let hashPass = await hashPassword(req.body.password);
    req.body.password = hashPass;

    const adminData = await adminModel.create({
      ...req.body,
      createdAt: getCurrentUnix(),
      createdBy: "",
    });
    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators(
          { ...adminData.toJSON() },
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

// updated Admin
export const updateAdminHandler = async (req, res) => {
  try {
    await updateAdminValidation.validateAsync({ ...req.body, ...req.params });
    let isAvailable = await adminModel.findOne({
      $and: [
        { isDeleted: false },
        { _id: { $ne: req.params.id } },
        {
          $or: [
            { email: req.body.email },
            { clientName: req.body.clientName },
            { userName: req.body.userName },
            {
              mobileNumber: req.body.mobileNumber,
            },
          ],
        },
      ],
    });

    isAvailable = await ClientModel.findOne({
      $and: [
        { isDeleted: false },
        { _id: { $ne: req.params.id } },
        {
          $or: [
            { clientName: req.body.clientName },
            { userName: req.body.userName },
            {
              mobileNumber: req.body.mobileNumber,
            },
          ],
        },
      ],
    });

    if (isAvailable)
      throw new CustomError(
        `Client is Already Exist with Email or Client Name or Mobile Number`
      );

    let updatedData = await adminModel.findOneAndUpdate(
      { _id: req.params.id },
      { ...req.body },
      { new: true }
    );

    if (!updatedData) throw new CustomError(`Client does not exist`);

    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators(
          { ...updatedData.toJSON() },
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

// delete adminModel
export const deleteAdminHandler = async (req, res) => {
  try {
    if (!req.params.id) throw new CustomError(`Please provide vaild id`);
    const isAvailable = await adminModel.findOne({
      isDeleted: false,
      id: req.params.id,
    });
    if (!isAvailable) throw new CustomError(`Admin dosnt't exists`);

    isAvailable.isDeleted = true;
    await isAvailable.save();

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

// login adminModel
export const loginAdminHandler = async (req, res) => {
  try {
    await loginAdminValidation.validateAsync(req.body);
    let loginData = await adminModel.findOne({
      email: req.body.email,
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
    let jswToken = await getJwt(loginDataRaw);

    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators(
          { token: jswToken, userData: loginData, loginCompleted: true },
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
