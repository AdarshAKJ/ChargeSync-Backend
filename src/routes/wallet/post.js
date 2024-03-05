import { StatusCodes } from "http-status-codes";
import { getCurrentUnix } from "../../commons/common-functions";

import { responseGenerators } from "../../lib/utils";
import { ValidationError } from "joi";
import { CustomError } from "../../helpers/custome.error";
import { addBalanceToWalletValidation } from "../../helpers/validations/wallet.validation";

import WalletModel from "../../models/wallet";
import WalletTransactionModel from "../../models/walletTransaction";

export const addAmountToWallet = async (req, res) => {
  try {
    console.log(req.session);
    await addBalanceToWalletValidation.validateAsync(req.body);
    const { amount } = req.body;
    const clientId = req.session.clientId || req.query.clientId;
    const customerId = req.session._id || req.query.customerId;

    let wallet = await WalletModel.findOne({ clientId, customerId });

    if (!wallet) {
      throw new CustomError(
        "Wallet not found for the provided clientId and customerId."
      );
    }

    const previousBalance = wallet.amount;

    wallet.amount += amount;

    await wallet.save();

    // Add wallet history
    await WalletTransactionModel.create({
      clientId: clientId,
      customerId: customerId,
      preBalance: previousBalance,
      effectedBalance: wallet.amount,
      amount: amount,
      type: "CREDITED",
      reason: "Amount added to wallet",
      source: "RAZORPAY",
      created_at: getCurrentUnix(),
      updated_at: getCurrentUnix(),
      created_by: req.session._id,
      updated_by: req.session._id,
    });

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          previousBalance,
          currentBalance: wallet.amount,
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
