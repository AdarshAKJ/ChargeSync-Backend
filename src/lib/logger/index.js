import * as winston from 'winston';
import config from '../../../config'
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone'
dayjs.extend(utc)
dayjs.extend(timezone);
// eslint-disable-next-line no-undef
let time_zone = config.TIMEZONE;

class TimestampFirst {
  enabled;

  constructor(enabled = true) {
    this.enabled = enabled;
  }

  transform(obj) {
    if (this.enabled) {
      return { timestamp: obj.timestamp, ...obj };
    }
    return obj;
  }
}

const myFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  new TimestampFirst(true),
  winston.format.json(),
);

const logger = winston.createLogger({
  level: 'info',
  // format: winston.format.json(),
  format: myFormat,
  transports: [
    new winston.transports.File({
      filename: `./logs/error_${dayjs(new Date()).tz(time_zone).format('DD-MM-YYYY')}.log`,
      level: 'error',
    }),
  ],
});

// eslint-disable-next-line no-undef
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}

export default logger;
