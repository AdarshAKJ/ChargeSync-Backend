import { StatusCodes } from "http-status-codes";
import { setPagination } from "../../commons/common-functions";

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
      await addBalanceToWalletValidation.validateAsync(req.body);
      const { clientId, customerId, amount } = req.body;

      let wallet = await WalletModel.findOne({ clientId, customerId });

      if (!wallet) {
          throw new CustomError("Wallet not found for the provided clientId and customerId.");
      }

      const previousBalance = wallet.amount;

      wallet.amount += amount;

      await wallet.save();

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


export const getCurrentBalance = async (req, res) => {
  try {

      const { clientId, customerId } = req.body;

      const wallet = await WalletModel.findOne({ clientId, customerId });

      if (!wallet) {
          throw new CustomError("Wallet not found for the provided clientId and customerId.");
      }

      return res.status(StatusCodes.OK).send(
          responseGenerators({ balance: wallet.amount }, StatusCodes.OK, "SUCCESS", 0)
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
