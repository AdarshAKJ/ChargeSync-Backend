import { StatusCodes } from "http-status-codes";
import { getCurrentUnix, setPagination } from "../../commons/common-functions";
import { CustomError } from "../../helpers/custome.error";
import {
  createVehicleValidation,
  singleVehicleValidation,
  updateVehicleValidation,
} from "../../helpers/validations/vehicle.validation";
import { responseGenerators } from "../../lib/utils";
import VehicleModel from "../../models/vehicle";
import { ValidationError } from "joi";

// add  vehicle
export const createVehicleHandler = async (req, res) => {
  try {
    await createVehicleValidation.validateAsync(req.body);

    const isAvailable = await VehicleModel.findOne({
      $and: [
        { isDeleted: false },
        { clientId: req.session.clientId },
        { customerId: req.session._id },
        { vehicleNumber: req.body.vehicleNumber },
      ],
    });

    if (isAvailable)
      throw new CustomError(
        `The Vehicle you are trying to create is already registered for that user.`
      );

    let vehicleData = await VehicleModel.create({
      ...req.body,
      customerId: req.session._id,
      clientId: req.session.clientId,
      created_by: req.session._id,
      updated_by: req.session._id,
      created_at: getCurrentUnix(),
      updated_at: getCurrentUnix(),
    });

    if (!vehicleData)
      throw new CustomError(
        `We are encountering some errors from our side. Please try again later.`
      );

    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators(
          { VehicleData: vehicleData.toJSON() },
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

// update vehicle
export const updateVehicleHandler = async (req, res) => {
  try {
    await updateVehicleValidation.validateAsync({
      ...req.body,
      ...req.params,
    });

    const isAvailable = await VehicleModel.findOne({
      $and: [
        { _id: { $ne: req.params.id } },
        { isDeleted: false },
        { clientId: req.session.clientId },
        { customerId: req.session._id },
        { vehicleNumber: req.body.vehicleNumber },
      ],
    });

    if (isAvailable)
      throw new CustomError(
        `Vehicle is not Found!.`
      );

    let vehicleData = await VehicleModel.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          ...req.body,
          created_by: req.session._id,
          updated_by: req.session._id,
          created_at: getCurrentUnix(),
          updated_at: getCurrentUnix(),
        },
      },
      { new: true } // This option returns the modified document
    );

    if (!vehicleData) {
      throw new CustomError(
        `We are encountering some errors from our side. Please try again later.`
      );
    }

    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators(
          { VehicleData: vehicleData.toJSON() },
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

// list vehicles
export const listVehicleHandler = async (req, res) => {
  try {
    let where = {
      isDeleted: false,
      clientId: req.session.clientId,
      customerId: req.session._id,
    };

    if (req.query?.search) {
      where = {
        ...where,
        ...{
          $or: [
            { name: new RegExp(req.query?.search.toString(), "i") },
            {
              vehicleNumber: new RegExp(req.query?.search.toString(), "i"),
            },
            { vehicleType: new RegExp(req.query?.search.toString(), "i") },
          ],
        },
      };
    }

    const pagination = setPagination(req.query);

    const vehicles = await VehicleModel.find(where)
      .sort(pagination.sort)
      .skip(pagination.offset)
      .limit(pagination.limit)
      .lean()
      .exec();

    let total_count = await VehicleModel.count(where);

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          paginatedData: vehicles,
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

// get single vehicle
export const singleVehicleHandler = async (req, res) => {
  try {
    await singleVehicleValidation.validateAsync({
      ...req.params,
    });

    let where = {
      _id: req.params.id,
      isDeleted: false,
      clientId: req.session.clientId,
      customerId: req.session._id,
    };
    const vehicle = await VehicleModel.findOne(where).lean().exec();

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        {
          vehicleData: vehicle,
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
