/* eslint-disable no-console */
import server from "./src";
import { logsError } from "./src/lib/utils";
import { mongooseConnection } from "./src/mongodb";

let db;
// eslint-disable-next-line no-undef
const port = 8003;

/** Connect to Mongo */

(async () => {
  try {
    db = await mongooseConnection();
    if (db) {
      console.time(
        `⚡️ server started with 👍🏼 database connected & redis connected http://localhost:${port} in `
      );
      server.listen(port, () => {
        console.timeEnd(
          `⚡️ server started with 👍🏼 database connected http://localhost:${port} in `
        );
      });
    }
  } catch (error) {
    console.log(error);
    logsError(error);
    console.timeEnd(
      `👎🏻 database or redis connection has some problem : ${JSON.stringify(
        error
      )}`
    );
  }
})();


console.log(process.env.NODE_ENV)
export default db;
