import axios from "axios"
import config from "../../config"


export const sendMessage = async (number, otp) => {
    let configData = {
        method: 'POST',
        maxBodyLength: Infinity,
        url: 'https://www.fast2sms.com/dev/bulkV2',
        headers: {
            authorization: config.FAST2SMS_API_KEY
        },
        data: { variables_values: otp, route: "otp", numbers: number },
    }
    return await axios.request(configData);
} 