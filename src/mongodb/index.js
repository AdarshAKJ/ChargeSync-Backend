import mongoose from "mongoose";
import * as dotenv from "dotenv";
import configVariables from "../../config";

dotenv.config();

console.log(
  "=================================== ",
  process.env.NODE_ENV,
  " Server ================================= "
);
// eslint-disable-next-line no-undef
const dbConfig = configVariables.DATABASE_CONNECTION_URI;

/** Connect to Mongo */
export const mongooseConnection = async () => {
  return await mongoose.connect(dbConfig, { retryWrites: true, w: "majority" });
};

export default mongoose;
