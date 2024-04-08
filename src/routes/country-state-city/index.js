import { ValidationError } from "joi";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "../../helpers/custome.error";
import { responseGenerators } from "../../lib/utils";
import fs from "fs";

// Get single player details based on playerId
export const getCountryStateCityHandler = async (req, res) => {
    try {
        // Read the JSON file synchronously
        const data = fs.readFileSync(
            "src/commons/country-state-city.JSON", "utf8"
        );

        // Parse the JSON data
        const countryStateCityData = JSON.parse(data);

        // Send response with the parsed JSON data
        return res
            .status(StatusCodes.OK)
            .send(
                responseGenerators(countryStateCityData, StatusCodes.OK, "Data fetched successfully", 0)
            );
    } catch (error) {
        if (error instanceof ValidationError || error instanceof CustomError) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .send(
                    responseGenerators({}, StatusCodes.BAD_REQUEST, error.message, 1)
                );
        }
        console.error(error);
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
