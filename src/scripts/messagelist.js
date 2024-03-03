import { getCurrentUnix } from "../commons/common-functions";
import MessageModel from "../models/messages";

export const addMessage = () => {
    console.log("Add Message Script EVENT Added");
    setTimeout(async function () {
      console.log("Add Message Script Started");
    let messageTransaction = [{
        clientId: "TFhKbSohMiyDXL2fiNi2ObRjT6Q7pGJ7LU1VtGigzB1708145103966",
        customerId: "jQWMyOgKo0XL9ujIwr1Vhy-R_MBciKMAhlUn5HegmT1709046309162",
        clientUserId: "RB1FzOUnVO-9fKoHGA0zMF9SdoZRnlCED9mKfOBHZH1708145161490",
        message: "Displaying a message",
        isPreserved: "false",
        isRead: "false",
        created_by: "jQWMyOgKo0XL9ujIwr1Vhy-R_MBciKMAhlUn5HegmT1709046309162",
        updated_by: "jQWMyOgKo0XL9ujIwr1Vhy-R_MBciKMAhlUn5HegmT1709046309162",
        created_at: getCurrentUnix(),
        updated_at: getCurrentUnix(),
},
{
    clientId: "TFhKbSohMiyDXL2fiNi2ObRjT6Q7pGJ7LU1VtGigzB1708145103966",
    customerId: "jQWMyOgKo0XL9ujIwr1Vhy-R_MBciKMAhlUn5HegmT1709046309162",
    clientUserId: "RB1FzOUnVO-9fKoHGA0zMF9SdoZRnlCED9mKfOBHZH1708145161490",
    message: "Displaying 2nd Message",
    isPreserved: "false",
    isRead: "false",
    created_by: "jQWMyOgKo0XL9ujIwr1Vhy-R_MBciKMAhlUn5HegmT1709046309162",
    updated_by: "jQWMyOgKo0XL9ujIwr1Vhy-R_MBciKMAhlUn5HegmT1709046309162",
    created_at: getCurrentUnix(),
    updated_at: getCurrentUnix(),
},{
    clientId: "TFhKbSohMiyDXL2fiNi2ObRjT6Q7pGJ7LU1VtGigzB1708145103966",
    customerId: "jQWMyOgKo0XL9ujIwr1Vhy-R_MBciKMAhlUn5HegmT1709046309162",
    clientUserId: "RB1FzOUnVO-9fKoHGA0zMF9SdoZRnlCED9mKfOBHZH1708145161490",
    message: "Displaying 3rd Message",
    isPreserved: "false",
    isRead: "false",
    created_by: "jQWMyOgKo0XL9ujIwr1Vhy-R_MBciKMAhlUn5HegmT1709046309162",
    updated_by: "jQWMyOgKo0XL9ujIwr1Vhy-R_MBciKMAhlUn5HegmT1709046309162",
    created_at: getCurrentUnix(),
    updated_at: getCurrentUnix(),
}
]
await MessageModel.insertMany(messageTransaction);
console.log("Add Message Script Completed");
}, 10000);
};