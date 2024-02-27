import { StatusCodes } from 'http-status-codes';
import Joi from "joi";
import WalletTransactionModel from '../../models/walletTransaction.js';
import { responseGenerators } from "../../lib/utils";
import { CustomError } from '../../helpers/custome.error';

const { ValidationError } = Joi;

import walletTransactionValidation from '../../helpers/validations/wallet.validation.js';

export const listWalletTransactions = async (req, res) => {
  try {
    const querySchema = Joi.object({
      type: Joi.string().optional(),
      source: Joi.string().optional(),
    });

    const { error: queryError } = querySchema.validate(req.query);
    if (queryError) {
      throw new ValidationError(queryError.details.map(detail => detail.message).join(', '));
    }

    // Validate request body against walletTransactionValidation schema
    await walletTransactionValidation.validateAsync(req.body);

    const clientId = req?.session?.clientId;

    const filters = {
      ...(clientId && { clientId }),
      ...(req.query.type && { type: req.query.type }),
      ...(req.query.source && { source: req.query.source }),
    };

    const walletTransactions = await WalletTransactionModel.find(filters)
      .lean()
      .exec();

    return res.status(StatusCodes.OK).send(
      responseGenerators({ walletTransactions }, StatusCodes.OK, 'Success', 0)
    );
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
}