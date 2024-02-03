import { StatusCodes } from "http-status-codes";
import { ERROR } from "../commons/global-constants";
import { logsErrorAndUrl, responseGenerators } from "../lib/utils";
import config from "../../config";
import path from "path"

export const privateKeyMiddleware = async(req, res, next) => {
    try {
        const { private_api_key } = req.headers;
        if (!private_api_key) {
            return res
                .status(StatusCodes.UNAUTHORIZED)
                .send(
                    responseGenerators(
                        null,
                        StatusCodes.UNAUTHORIZED,
                        ERROR.PRIVATE_KEY_MISS,
                        1
                    )
                );
        }

        // eslint-disable-next-line no-undef
        if (private_api_key !== config.PRIVATE_API_KEY)
            return res
                .status(StatusCodes.UNAUTHORIZED)
                .send(
                    responseGenerators(
                        null,
                        StatusCodes.UNAUTHORIZED,
                        ERROR.PRIVATE_KEY_MISS_MATCH,
                        1
                    )
                );

        next();
    } catch (error) {
        logsErrorAndUrl(req, error, path.basename(__filename));
        return res
            .status(StatusCodes.UNAUTHORIZED)
            .send(
                responseGenerators(
                    null,
                    StatusCodes.UNAUTHORIZED,
                    "Unauthorized access. Please provide valid Private key.",
                    1
                )
            )
    }
};