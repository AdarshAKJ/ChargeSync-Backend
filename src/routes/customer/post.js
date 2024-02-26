import { ValidationError } from "webpack";
import {
  createCustomerValidation,
  listCustomerValidation,
  singleCustomerValidation,
  updateCustomerValidation,
} from "../../helpers/validations/customer.validation";
import { responseGenerators } from "../../lib/utils";
import { checkClientIdAccess } from "../../middleware/checkClientIdAccess";
import CustomerModel from "../../models/customer";
import WalletModel from "../../models/wallet";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "../../helpers/custome.error";
import {
  getCurrentUnix,
  hashPassword,
  setPagination,
} from "../../commons/common-functions";

export const createCustomerHandler = async (req, res) => {
  try {
    await createCustomerValidation.validateAsync(req.body);
    checkClientIdAccess(req.session, req.body.clientId);

    const isAvailable = await CustomerModel.findOne({
      $or: [
        {
          phoneNumber: req.body.phoneNumber,
          countryCode: req.body.countryCode,
          clientId: req.body.clientId,
          isDeleted: false,
        },

        {
          email: req.body.email.toLowerCase(),
          clientId: req.body.clientId,
          isDeleted: false,
        },
      ],
    });

    if (isAvailable)
      throw new CustomError(
        `The Customer you are trying to create is already registered.`
      );

    let customerData = await CustomerModel.create({
      ...req.body,
      email: req.body.email.toLowerCase(),
      password: await hashPassword(req.body.password),
      created_by: req.session._id,
      updated_by: req.session._id,
      created_at: getCurrentUnix(),
      updated_at: getCurrentUnix(),
    });

    let walletData = await WalletModel.create({
      clientId: req.body.clientId,
      userId: customerData._id,
      amount: 0,
      created_by: req.session._id,
      updated_by: req.session._id,
      created_at: getCurrentUnix(),
      updated_at: getCurrentUnix(),
    });

    if (!walletData)
      throw new CustomError(
        `We are encountering some errors from our side. Please try again later.`
      );

    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators(
          { userData: customerData.toJSON() },
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

export const updateCustomerHandler = async (req, res) => {
  try {
    await updateCustomerValidation.validateAsync({
      ...req.body,
      ...req.params,
    });
    checkClientIdAccess(req.session, req.body.clientId);

    let isAvailable;

    isAvailable = await CustomerModel.findOne({
      $and: [
        { isDeleted: false },
        { clientId: req.body.clientId },
        { _id: { $ne: req.params.id } },
        {
          $or: [
            { email: req.body.email },
            {
              mobileNumber: req.body.mobileNumber,
              countryCode: req.body.countryCode,
            },
          ],
        },
      ],
    });

    if (isAvailable) throw new CustomError(`Customer is already available`);

    let customerData = await CustomerModel.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      {
        ...req.body,
        updatedAt: getCurrentUnix(),
        updatedBy: req.tokenData._id,
      }
    );

    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators(
          { ...customerData.toJSON() },
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

export const listCustomerHandler = async (req, res) => {
  try {
    await listCustomerValidation.validateAsync(req.body);
    checkClientIdAccess(req.session, req.body.clientId);

    let where = {
      isDeleted: false,
      clientId: req.session.clientId || req.body.clientId,
    };
    if (req.query?.search) {
      where = {
        ...where,
        search: new RegExp(req.query?.search.toString(), "i"),
      };
    }

    const pagination = setPagination(req.query);

    const customers = await CustomerModel.find(where)
      .select("-password")
      .sort(pagination.sort)
      .skip(pagination.offset)
      .limit(pagination.limit)
      .lean()
      .exec();

    if (!customers) throw new CustomError(`No Customer found.`);
    let total_count = await CustomerModel.count(where);

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          paginatedData: customers,
          totalCount: total_count,
          itemsPerPage: pagination.limit,
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

export const singleCustomerHandler = async (req, res) => {
  try {
    await singleCustomerValidation.validateAsync({
      ...req.body,
      ...req.params,
    });
    checkClientIdAccess(req.session, req.body.clientId);

    let where = {
      _id: req.params.id,
      isDeleted: false,
      clientId: req.session.clientId || req.query.clientId,
    };

    const customer = await CustomerModel.find(where)
      .select("-password")
      .lean()
      .exec();

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          singleCustomerData: customer,
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
