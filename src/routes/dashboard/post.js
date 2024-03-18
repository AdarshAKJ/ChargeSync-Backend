import { StatusCodes } from "http-status-codes";
import { responseGenerators } from "../../lib/utils";
import { ValidationError } from "joi";
import { CustomError } from "../../helpers/custome.error";
import { checkClientIdAccess } from "../../middleware/checkClientIdAccess";
import ChargerModel from "../../models/charger";
import TransactionModel from "../../models/transaction";
import ChargerConnectorModel from "../../models/chargerConnector";
// import { getMonthStartData } from "../../commons/common-functions";

export const dashboardHandler = async (req, res) => {
  try {
    checkClientIdAccess(
      req.session,
      req?.body?.clientId || req.session.clientId
    );

    // let monthStartData = getMonthStartData();

    let responseData = {
      chargerCount: 0,
      transactionCount: 0,
      revenueCount: 0,
      activeChargingCount: 0,
      onlineChargerCount: 0,
      offlineChargerCount: 0,
      faultyChargerCount: 0,
    };

    // charger count
    responseData.chargerCount = await ChargerModel.countDocuments({
      clientId: req.session.clientId,
      isDeleted: false,
      // created_at: { $gte: monthStartData },
    });

    // transaction count
    responseData.transactionCount = await TransactionModel.countDocuments({
      clientId: req.session.clientId,
      // created_at: { $gte: monthStartData },
    });

    // revenue amount
    responseData.revenueCount = await TransactionModel.aggregate([
      {
        $match: {
          clientId: req.session.clientId,
          // created_at: { $gte: monthStartData },
        },
      },
      {
        $group: {
          _id: null,
          totalCost: { $sum: "$totalCost" },
        },
      },
    ]);
    responseData.revenueCount = responseData?.revenueCount[0]?.totalCost || 0;

    // Active charging.
    responseData.activeChargingCount =
      await ChargerConnectorModel.countDocuments({
        clientId: req.session.clientId,
        status: "Charging",
        isDeleted: false,
        // created_at: { $gte: monthStartData },
      });

    // Online chargers count
    responseData.onlineChargerCount = await ChargerModel.countDocuments({
      clientId: req.session.clientId,
      status: "ONLINE",
      isDeleted: false,
    });

    // offline chargers count
    responseData.offlineChargerCount = await ChargerModel.countDocuments({
      clientId: req.session.clientId,
      status: "OFFLINE",
      isDeleted: false,
    });

    // CONFIGURING chargers count
    responseData.faultyChargerCount = await ChargerModel.countDocuments({
      clientId: req.session.clientId,
      status: "CONFIGURING",
      isDeleted: false,
    });

    return res
      .status(StatusCodes.OK)
      .send(responseGenerators(responseData, StatusCodes.OK, "Success", 0));
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
