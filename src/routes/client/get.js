import { ValidationError } from "joi";
import { CustomError } from "../../helpers/custome.error";
import { responseGenerators } from "../../lib/utils";

import { StatusCodes } from "http-status-codes";
import ClientModel from "../../models/client";
import { setPagination } from "../../commons/common-functions";



// List Client API
export const listClient = async (req, res) => {
  try {
    let where = {
      isDeleted: false,
    };

    if (req.query?.search) {
      where = {
        ...where,
        ...{
          $or: [
            { name: new RegExp(req.query?.search.toString(), "i") },
            { contactPerson: new RegExp(req.query?.search.toString(), "i") },
            { contactPersonEmailAddress: new RegExp(req.query?.search.toString(), "i") },
            { contactPersonPhoneNumber: new RegExp(req.query?.search.toString(), "i") },
          ],
        },
      };
    }

    const pagination = setPagination(req.query);
    
    const clients = await ClientModel.find(where)
      .lean()
      .sort(pagination.sort)
      .skip(pagination.offset)
      .limit(pagination.limit)
      .exec();

    if (!clients || clients.length === 0) {
      throw new CustomError(`No clients found.`);
    }

    const total_count = await ClientModel.countDocuments();

    return res.status(StatusCodes.OK).send(
      responseGenerators(
        { paginatedData: clients, totalCount: total_count },
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

// Delete Client API
export const deleteClient = async (req, res) => {
  try {
    const { id: _id } = req.params;
    const client = await ClientModel.findOne({ _id, isDeleted: false });

    if (!client) throw new CustomError(`This client could not be found.`);

    client.isDeleted = true;

    await client.save();

    return res
      .status(StatusCodes.OK)
      .send(responseGenerators({}, StatusCodes.OK, "SUCCESS", 0));
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

// Get Single Client API
export const getSingleClientHandler = async (req, res) => {
  try {
    const clientId = req.params.id;

    const client = await ClientModel.findOne({
      _id: clientId,
      isDeleted: false,
    });

    if (!client) {
      throw new CustomError("Client not found");
    }

    return res
      .status(StatusCodes.OK)
      .send(
        responseGenerators({ ...client.toJSON() }, StatusCodes.OK, "SUCCESS", 0)
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

