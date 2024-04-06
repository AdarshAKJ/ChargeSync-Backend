import { StatusCodes } from "http-status-codes";
import { responseGenerators } from "../../lib/utils";
import { ValidationError } from "joi";
import { CustomError } from "../../helpers/custome.error";
import { encryptData } from "../../commons/common-functions";

export const encryptDataHandler = async (req, res) => {
    try {
        if (!req.body) throw new CustomError(`Please provide Data .`);


        // let jswToken = await getJwt({ ...req.body });
        return res.status(StatusCodes.OK).send(
            responseGenerators(
                {
                    encryptedData: encryptData(JSON.stringify(req.body)),
                },
                StatusCodes.OK,
                "success",
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

