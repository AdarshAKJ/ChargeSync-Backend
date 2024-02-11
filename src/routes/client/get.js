import { ValidationError } from "webpack";
import { CustomError } from "../../helpers/custome.error";
import { responseGenerators } from "../../lib/utils";

import ClientModel from "../../models/client";

export const listClient = async (req, res) => {
    try {
        const clients = await ClientModel.find({ isDeleted: false });

        return res
        .status(StatusCodes.OK)
        .send(
          responseGenerators(
            { ...clients.toJSON() },
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
}

export const deleteClient = async (req, res) => {
    try {
        const {id: _id} = req.params;
        const client = await ClientModel.findOne({ _id, isDeleted: false });

        if(!client) throw new CustomError(`This client could not be found.`);

        client.isDeleted = true;

        await client.save();

        return res
        .status(StatusCodes.OK)
        .send(
          responseGenerators(
            {},
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
}