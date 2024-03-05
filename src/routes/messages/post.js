import MessageModel from "../../models/messages";
import { ValidationError } from "joi";
import { CustomError } from "../../helpers/custome.error"; 
import { StatusCodes } from "http-status-codes";
import { responseGenerators } from "../../lib/utils";
import { getCurrentUnix } from "../../commons/common-functions";

export const addMessage = async (req, res) => {
    try {
        console.log("Add Message Script Started");
        let messageTransaction = [
            {
                clientId: "TFhKbSohMiyDXL2fiNi2ObRjT6Q7pGJ7LU1VtGigzB1708145103966",
                customerId: "jQWMyOgKo0XL9ujIwr1Vhy-R_MBciKMAhlUn5HegmT1709046309162",
                clientUserId: "RB1FzOUnVO-9fKoHGA0zMF9SdoZRnlCED9mKfOBHZH1708145161490",
                title: "Title of the message",
                message: "Displaying 4th message",
                isPreserved: false,
                isRead: false,
                created_by: "jQWMyOgKo0XL9ujIwr1Vhy-R_MBciKMAhlUn5HegmT1709046309162",
                updated_by: "jQWMyOgKo0XL9ujIwr1Vhy-R_MBciKMAhlUn5HegmT1709046309162",
                created_at: getCurrentUnix(), 
                updated_at: getCurrentUnix(), 
            },
        ];

        await MessageModel.insertMany(messageTransaction);

        console.log("Add Message Script Completed");
        res.status(200).json({ message: "Messages added successfully" });
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
