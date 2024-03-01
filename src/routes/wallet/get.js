import { StatusCodes } from "http-status-codes";
import WalletTransactionModel from "../../models/walletTransaction.js";
import { responseGenerators } from "../../lib/utils";
import { CustomError } from "../../helpers/custome.error";
import walletTransactionValidation from "../../helpers/validations/wallet.validation.js";
import { ValidationError } from "joi";
import { checkClientIdAccess } from "../../middleware/checkClientIdAccess.js";

// list wallet transaction for customer
export const listWalletCustomerTransactions = async (req, res) => {
  try {
    await walletTransactionValidation.validateAsync(req.body);

    const clientId = req?.session?.clientId;

    const filters = {
      customerId: req?.session?._id,
      ...(clientId && { clientId }),
      ...(req.query.type && { type: req.query.type }),
      ...(req.query.source && { source: req.query.source }),
    };

    const walletTransactions = await WalletTransactionModel.find(filters)
      .lean()
      .exec();

    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators({ walletTransactions }, StatusCodes.OK, "Success", 0)
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

// list wallet transaction for admin
export const listWalletTransactions = async (req, res) => {
  try {
    await walletTransactionValidation.validateAsync(req.body);

    const clientId = req?.body?.clientId || req?.session?.clientId;

    checkClientIdAccess(req.session, req.body.clientId);

    const filters = {
      ...(clientId && { clientId }),
      ...(req.query.type && { type: req.query.type }),
      ...(req.query.source && { source: req.query.source }),
    };

    const walletTransactions = await WalletTransactionModel.find(filters)
      .lean()
      .exec();

    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators({ walletTransactions }, StatusCodes.OK, "Success", 0)
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
