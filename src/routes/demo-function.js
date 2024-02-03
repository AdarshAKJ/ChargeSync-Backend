// import { CustomError } from "../../helpers/custome.error";
// import { logsErrorAndUrl, responseGenerators } from "../../lib/utils";
// import path from 'path';
// import { ValidationError } from 'joi'
// import { StatusCodes } from "http-status-codes";

// export const addSubscriptionHandler = async(req, res) => {
//     try {
//         await registerUserValidation.validateAsync(req.body);

//     } catch (error) {
//         if (error instanceof ValidationError || error instanceof CustomError) {
//             return res
//                 .status(StatusCodes.BAD_REQUEST)
//                 .send(
//                     responseGenerators({}, StatusCodes.BAD_REQUEST, error.message, 1)
//                 );
//         }
//         console.log(JSON.stringify(error))
//         return res
//             .status(StatusCodes.INTERNAL_SERVER_ERROR)
//             .send(
//                 responseGenerators({},
//                     StatusCodes.INTERNAL_SERVER_ERROR,
//                     "Internal Server Error",
//                     1
//                 )
//             );
//     }
// }
