import { ValidationError } from "webpack";
import { customerValidation } from "../../helpers/validations/customer.validation";
import { responseGenerators } from "../../lib/utils";
import { checkClientIdAccess } from "../../middleware/checkClientIdAccess";
import CustomerModel from "../../models/customer";
import WalletModel from "../../models/wallet";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "../../helpers/custome.error";
import { getCurrentUnix } from "../../commons/common-functions";

export const createCustomerHandler = async (req, res) => {
  try {
    await customerValidation.validateAsync(req.body);
    checkClientIdAccess(req.session, req.body.clientId);

    const isAvailable = await CustomerModel.findOne({
      $and: [
        { isDeleted: false },
        { clientId: req.body.clientId },
        {
          $or: [
            { email: req.body.email },
            { userName: req.body.userName },
            {
              mobileNumber: req.body.mobileNumber,
              countryCode: req.body.countryCode,
            },
          ],
        },
      ],
    });

    if (isAvailable)
      throw new CustomError(
        `The Customer you are trying to create is already registered.`
      );

    let customerData = await CustomerModel.create({
      ...req.body,
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
          { ...customerData.toJSON(), ...walletData.toJSON() },
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
