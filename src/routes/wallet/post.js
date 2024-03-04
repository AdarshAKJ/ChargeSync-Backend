import { StatusCodes } from "http-status-codes";
import { getCurrentUnix, setPagination } from "../../commons/common-functions";

import { responseGenerators } from "../../lib/utils";
import { ValidationError } from "joi";
import { CustomError } from "../../helpers/custome.error";
import {
  addBalanceToWalletValidation,
  getChargerSelectValidation,
  getStationSelectValidation,
} from "../../helpers/validations/wallet.validation";
import { checkClientIdAccess } from "../../middleware/checkClientIdAccess";
import ChargerModel from "../../models/charger";
import ChargingStationModel from "../../models/chargingStations";
import WalletModel from "../../models/wallet";
import WalletTransactionModel from "../../models/walletTransaction";

// get-charger-select
export const getChargerSelectHandler = async (req, res) => {
  try {
    await getChargerSelectValidation.validateAsync(req.body);

    checkClientIdAccess(req.session, req.body.clientId);

    let where = {
      isDeleted: false,
      clientId: req?.session?.clientId || req?.body?.clientId,
    };

    if (req.query?.search) {
      where = {
        ...where,
        name: new RegExp(req.query?.search.toString(), "i"),
      };
    }

    const pagination = setPagination(req.query);

    const charger = await ChargerModel.find(where)
      .select("serialNumber name")
      .sort(pagination.sort)
      .skip(pagination.offset)
      .limit(pagination.limit)
      .lean()
      .exec();

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          selectedCharger: charger,
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

// get-station-select
export const getStationSelectHandler = async (req, res) => {
  try {
    await getStationSelectValidation.validateAsync(req.body);

    checkClientIdAccess(req.session, req.body.clientId);

    let where = {
      isDeleted: false,
      clientId: req.session.clientId || req.query.clientId,
    };

    if (req.query?.search) {
      where = {
        ...where,
        station_name: new RegExp(req.query?.search.toString(), "i"),
      };
    }

    const pagination = setPagination(req.query);

    const station = await ChargingStationModel.find(where)
      .select("_id station_name")
      .sort(pagination.sort)
      .skip(pagination.offset)
      .limit(pagination.limit)
      .lean()
      .exec();

    if (!station) throw new CustomError("Station not found");

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          selectedStation: station,
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

export const addAmountToWallet = async (req, res) => {
  try {
    console.log(req.session);
    await addBalanceToWalletValidation.validateAsync(req.body);
    const { amount } = req.body;
    const clientId = req.session.clientId || req.query.clientId;
    const customerId = req.session._id || req.query.customerId;
    
    let wallet = await WalletModel.findOne({ clientId, customerId });

    if (!wallet) {
      throw new CustomError("Wallet not found for the provided clientId and customerId.");
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
      responseGenerators({
        previousBalance,
        currentBalance: wallet.amount,
      }, StatusCodes.OK, "SUCCESS", 0)
    );
  } catch (error) {
    if (error instanceof ValidationError || error instanceof CustomError) {
      return res.status(StatusCodes.BAD_REQUEST).send(
        responseGenerators({}, StatusCodes.BAD_REQUEST, error.message, 1)
      );
    }
    console.log(JSON.stringify(error));
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(
      responseGenerators({}, StatusCodes.INTERNAL_SERVER_ERROR, "Internal Server Error", 1)
    );
  }
};


