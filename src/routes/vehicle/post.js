import { StatusCodes } from "http-status-codes";
import { getCurrentUnix, setPagination } from "../../commons/common-functions";
import { CustomError } from "../../helpers/custome.error";
import {
  createVehicleValidation,
  listVehicleValidation,
  singleVehicleValidation,
  updateVehicleValidation,
} from "../../helpers/validations/vehicle.validation";
import { responseGenerators } from "../../lib/utils";
import { checkClientIdAccess } from "../../middleware/checkClientIdAccess";
import VehicleModel from "../../models/vehicle";
import { ValidationError } from "webpack";

export const createVehicleHandler = async (req, res) => {
  try {
    await createVehicleValidation.validateAsync(req.body);
    checkClientIdAccess(req.session, req.body.clientId);

    const isAvailable = await VehicleModel.findOne({
      $and: [
        { isDeleted: false },
        { clientId: req.body.clientId },
        { customerId: req.body.customerId },
        { vehicleNumber: req.body.vehicleNumber },
      ],
    });

    if (isAvailable)
      throw new CustomError(
        `The Vehicle you are trying to create is already registered for that user.`
      );

    let vehicleData = await VehicleModel.create({
      ...req.body,
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

export const updateVehicleHandler = async (req, res) => {
  try {
    await updateVehicleValidation.validateAsync({
      ...req.body,
      ...req.params,
    });
    checkClientIdAccess(req.session, req.body.clientId);

    const isAvailable = await VehicleModel.findOne({
      $and: [
        { _id: { $ne: req.params.id } },
        { isDeleted: false },
        { clientId: req.body.clientId },
        { customerId: req.body.customerId },
        { vehicleNumber: req.body.vehicleNumber },
      ],
    });

    if (isAvailable)
      throw new CustomError(
        `The Vehicle you are trying to Update is already registered for that user.`
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

export const listVehicleHandler = async (req, res) => {
  try {
    await listVehicleValidation.validateAsync(req.body);
    checkClientIdAccess(req.session, req.body.clientId);

    let where = {
      isDeleted: false,
      clientId: req.body.clientId,
      customerId: req.body.customerId,
    };

    if (req.query?.search) {
      where = {
        ...where,
        name: new RegExp(req.query?.search.toString(), "i"),
      };
    }

    if (req.query?.vehicleType) {
      where = {
        ...where,
        vehicleType: new RegExp(req.query?.vehicleType.toString(), "i"),
      };
    }
    if (req.query?.vehicleNumber) {
      where = {
        ...where,
        vehicleNumber: new RegExp(req.query?.vehicleNumber.toString(), "i"),
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

export const singleVehicleHandler = async (req, res) => {
  try {
    await singleVehicleValidation.validateAsync({
      ...req.body,
      ...req.params,
    });
    checkClientIdAccess(req.session, req.body.clientId);

    let where = {
      _id: req.params.id,
      isDeleted: false,
      clientId: req.body.clientId,
      customerId: req.body.customerId,
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
