import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import config from '../../config'
dotenv.config();

// Setup mongodb
const configs = {
  development: {
    // eslint-disable-next-line no-undef
    connection: config.DATABASE_CONNECTION_URI_DEV,
  },

  test: {
    // eslint-disable-next-line no-undef
    connection: config.DATABASE_CONNECTION_URI_TEST,
  },

  staging: {
    // eslint-disable-next-line no-undef
    connection: config.DATABASE_CONNECTION_URI_STAGE,
  },
};

//mongoose.set('debug', true);
// eslint-disable-next-line no-undef
const dbConfig = configs[process.env.NODE_ENV || 'development'].connection;

/** Connect to Mongo */
export const mongooseConnection = async () => {
  return await mongoose.connect(dbConfig, { retryWrites: true, w: 'majority' });
};

export default mongoose;


