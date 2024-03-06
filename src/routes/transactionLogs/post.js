import { StatusCodes } from "http-status-codes";
import { singleTransactionLogsValidation } from "../../helpers/validations/transactionLogs";
import { checkClientIdAccess } from "../../middleware/checkClientIdAccess";
import TransactionLogsModel from "../../models/transactionLogs";
import { CustomError } from "../../helpers/custome.error";
import { responseGenerators } from "../../lib/utils";
import { ValidationError } from "joi";

export const singleTransactionLog = async (req, res) => {
  try {
    await singleTransactionLogsValidation.validateAsync({
      ...req.body,
      ...req.params,
    });
    checkClientIdAccess(req.session, req.body.clientId);

    let where = {
      transactionId: req.params.id,
    };

    const aggregationPipeline = [
      {
        $match: where,
      },
      // {
      //   $lookup: {
      //     from: "transactions",
      //     localField: "transactionId",
      //     foreignField: "_id",
      //     as: "transactionsData",
      //     pipeline: [
      //       {
      //         $project: {
      //           clientId: 1,
      //           serialNumber: 1,
      //           connectorId: 1,
      //           status: 1,
      //           vehicleId: 1,
      //           perUnitCharges: 1,
      //         },
      //       },
      //     ],
      //   },
      // },
      // {
      //   $lookup: {
      //     from: "chargerConnectors",
      //     localField: "transactionsData.connectorId",
      //     foreignField: "_id",
      //     as: "chargerConnectorsData",
      //     pipeline: [
      //       {
      //         $project: {
      //           connectorId: 1,
      //         },
      //       },
      //     ],
      //   },
      // },
    ];

    const transactionlog = await TransactionLogsModel.aggregate(
      aggregationPipeline
    );

    if (!transactionlog) throw new CustomError(`No transactions found.`);

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          paginatedData: transactionlog,
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
