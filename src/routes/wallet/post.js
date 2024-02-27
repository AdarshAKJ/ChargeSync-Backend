import { StatusCodes } from 'http-status-codes';
import { responseGenerators } from '../lib/utils';
import WalletTransactionModel from '../src/models/walletTransaction.js';

export const listWalletTransactions = async (req, res) => { 
try {
    const { type, source } = req.query;
    const {clientId} = req.session.user.clientId;

    // Construct filter object based on provided query parameters
    const filters = {
      ...(clientId && { clientId }),
      ...(type && { type }),
      ...(source && { source }),
    };

    // Find wallet transactions based on filters
    const walletTransactions = await WalletTransactionModel.find(filters)
      .lean()
      .exec();  

      

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        { walletTransactions },
        StatusCodes.OK,
        'Success',
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
}



export default router;
