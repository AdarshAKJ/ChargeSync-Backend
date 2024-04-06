/* eslint-disable no-case-declarations */
import * as bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import http from "http";
import { StatusCodes } from "http-status-codes";
import logger from "./lib/logger";
import { responseValidation } from "./lib/utils";
import adminRoute from "./routes/admin";
import clientRouter from "./routes/client";
import clientUserRouter from "./routes/clientUsers";
import chargerStationRouter from "./routes/chargerStation";
import chargerRouter from "./routes/charger";
import transactionRouter from "./routes/transaction";
import transactionLogRouter from "./routes/transactionLogs";
import maintenanceRouter from "./routes/maintenance";
import customerRouter from "./routes/customer";
import vehicleRouter from "./routes/vehicle";
import walletRouter from "./routes/wallet";
import messageRouter from "./routes/messages";
import dashboardRouter from "./routes/dashboard";
import supportRouter from "./routes/support";
import { encryptDataHandler } from "./routes/encryptData";
import { decryptDataHandler } from "./routes/decryptData";

const app = express();
const server = new http.Server(app);

// eslint-disable-next-line no-undef
// if (process.env.NODE_ENV !== "development") {
// eslint-disable-next-line no-undef
//     app.use(cors({ origin: [config.FRONT_END_URL] }));
// } else {
app.use(cors({ origin: "*" }));
// }

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10000, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: "Too many request hit from this IP, please try again after 5 min.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(limiter);
app.use(helmet());

app.use((req, res, next) => {
  try {
    // set header for swagger.
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; font-src 'self'; img-src 'self'; script-src 'self'; style-src 'self'; frame-src 'self';"
    );
    logger.info(
      `------------ API Info ------------
      IMP - API called path: ${req.path},
      method: ${req.method},
      query: ${JSON.stringify(req.query)},
      remote address (main/proxy ip):,
      reference: ${req.headers.referer} ,
      user-agent: ${req.headers["user-agent"]}
      ------------ End ------------  `
    );
  } catch (error) {
    logger.error(`error while printing caller info path: ${req.path}`);
  }
  next();
});

const health = async (req, res) => {
  try {
    res.json({
      message: "We are ready to serve the charger API's",
      // eslint-disable-next-line no-undef
      env: process.env.NODE_ENV || "development",
      headers: req.headers,
    });
  } catch (error) {
    console.log(error);
  }
};

app.get("/", health);
app.use("/api/admin", adminRoute);
app.use("/api/client-user", clientUserRouter);
app.use("/api/client", clientRouter);
app.use("/api/charger-station", chargerStationRouter);
app.use("/api/charger", chargerRouter);
app.use("/api/transaction", transactionRouter);
app.use("/api/transaction-logs", transactionLogRouter);
app.use("/api/maintenance", maintenanceRouter);
app.use("/api/customer", customerRouter);
app.use("/api/vehicle", vehicleRouter);
app.use("/api/wallet", walletRouter);
app.use("/api/message", messageRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/support", supportRouter);
app.post("/api/encrypt-data", encryptDataHandler);
app.get("/api/decrypt-data/:token", decryptDataHandler);

app.use(express.json());

app.use((req, res) => {
  return res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .send(
      responseValidation(StatusCodes.INTERNAL_SERVER_ERROR, "No route found")
    );
});

app.use((error, req, res) => {
  return res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .send(
      responseValidation(
        StatusCodes.INTERNAL_SERVER_ERROR,
        process.env.NODE_ENV === "development" ? error.message : {}
      )
    );
});

//==================================================  Script =========================================//
// addWalletTransaction();
//addMessage();
//==================================================  Script =========================================//
export default server;
