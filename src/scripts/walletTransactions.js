import { getCurrentUnix } from "../commons/common-functions";
import WalletTransactionModel from "../models/walletTransaction";

export const addWalletTransaction = () => {
  console.log("Add Wallet Script EVENT Added");
  setTimeout(async function () {
    console.log("Add Wallet Script Started");
    let dummyTransaction = [
      {
        clientId: "TFhKbSohMiyDXL2fiNi2ObRjT6Q7pGJ7LU1VtGigzB1708145103966",
        customerId: "jQWMyOgKo0XL9ujIwr1Vhy-R_MBciKMAhlUn5HegmT1709046309162",
        preBalance: 1000,
        effectedBalance: 1010,
        amount: 10,
        type: "CREDITED",
        reason: "Balance Added",
        source: "RAZORPAY",
        created_by: "jQWMyOgKo0XL9ujIwr1Vhy-R_MBciKMAhlUn5HegmT1709046309162",
        updated_by: "jQWMyOgKo0XL9ujIwr1Vhy-R_MBciKMAhlUn5HegmT1709046309162",
        created_at: getCurrentUnix(),
        updated_at: getCurrentUnix(),
      },
      {
        clientId: "TFhKbSohMiyDXL2fiNi2ObRjT6Q7pGJ7LU1VtGigzB1708145103966",
        customerId: "jQWMyOgKo0XL9ujIwr1Vhy-R_MBciKMAhlUn5HegmT1709046309162",
        preBalance: 1010,
        effectedBalance: 1000,
        amount: 10,
        type: "DEBITED",
        reason: "Balance deducted",
        source: "WALLET",
        created_by: "jQWMyOgKo0XL9ujIwr1Vhy-R_MBciKMAhlUn5HegmT1709046309162",
        updated_by: "jQWMyOgKo0XL9ujIwr1Vhy-R_MBciKMAhlUn5HegmT1709046309162",
        created_at: getCurrentUnix(),
        updated_at: getCurrentUnix(),
      },
      {
        clientId: "TFhKbSohMiyDXL2fiNi2ObRjT6Q7pGJ7LU1VtGigzB1708145103966",
        customerId: "jQWMyOgKo0XL9ujIwr1Vhy-R_MBciKMAhlUn5HegmT1709046309162",
        preBalance: 1000,
        effectedBalance: 1010,
        amount: 10,
        type: "REFUNDED",
        reason: "Amount refunded",
        source: "WALLET",
        created_by: "jQWMyOgKo0XL9ujIwr1Vhy-R_MBciKMAhlUn5HegmT1709046309162",
        updated_by: "jQWMyOgKo0XL9ujIwr1Vhy-R_MBciKMAhlUn5HegmT1709046309162",
        created_at: getCurrentUnix(),
        updated_at: getCurrentUnix(),
      },
    ];

    await WalletTransactionModel.insertMany(dummyTransaction);
    console.log("Add Wallet Script Completed");
  }, 10000);
};
