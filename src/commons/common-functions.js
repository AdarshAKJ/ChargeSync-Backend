import * as bcrypt from "bcryptjs";
import crypto from "crypto";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { nanoid } from "nanoid";
import { totp } from "otplib";
import { default as config, default as configVariables } from "../../config";

const salt = bcrypt.genSaltSync(10);

// eslint-disable-next-line no-undef
require("dotenv").config();
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);
// eslint-disable-next-line no-undef
let time_zone = config.TIMEZONE;
export const intrmTokenCache = {};
export const sessionUser = {};
export const sessionApp = {};

export const add10MinToUnxi = (currentUnix) => {
  return dayjs.unix(currentUnix).add(10, "minutes").unix().toString();
};

export const add7DayToUnxi = (currentUnix) => {
  return dayjs.unix(currentUnix).add(7, "days").unix().toString();
};

export const getCurrentUnix = () => {
  return dayjs().tz(time_zone).unix().toString(); //generate the unix
};

export const generatePublicId = () => {
  return nanoid() + nanoid() + Date.now();
};

export const hashPassword = async (password) => {
  return bcrypt.hashSync(password, salt);
};

export const comparePassword = async (password, hash) => {
  return bcrypt.compareSync(password, hash);
};

export const capitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const generateSecret = () => {
  return crypto.randomBytes(16).toString("hex");
};

export const generateTOTP = (secret, purpose) => {
  const step = 30;
  const digits = 6;
  const algorithm = "sha1";
  const window = 600;

  totp.options = {
    digits: digits,
    step: step,
    window: window,
    algorithm: algorithm,
  };
  totp.options = {
    digits: digits,
    step: step,
    window: window,
    algorithm: algorithm,
  };
  const code = totp.generate(secret);
  const expiresAt = add10MinToUnxi(getCurrentUnix());
  const newOtpSecret = {
    secret,
    purpose,
    createdAt: new Date(),
    expiresAt,
  };

  return { code, newOtpSecret };
};

export const verifyTotp = (secret, code) => {
  const step = 30;
  const digits = 6;
  const algorithm = "sha1";
  const window = 600;

  totp.options = {
    digits: digits,
    step: step,
    window: window,
    algorithm: algorithm,
  };

  const isValid = totp.check(code, secret);
  return isValid;
};

export const generateApiKey = (length = 32) => {
  const buffer = crypto.randomBytes(length);
  return buffer.toString("base64");
};
export const generatePassword = async () => {
  return new Promise((resolve) => {
    const length = 8; // Length of the generated password
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset.charAt(randomIndex);
    }

    resolve(password);
  });
};

export const setPagination = (options) => {
  const sort = {};
  if (options.sort_column) {
    const sortColumn = options.sort_column;
    const order =
      (options && options.sort_order === "1") ||
      (options && options.sort_order == "asc")
        ? 1
        : -1;
    sort[sortColumn] = order;
  } else {
    sort.created_at = -1;
  }

  const limit = +options.limit ? +options.limit : 10;
  const offset =
    ((+options.offset ? +options.offset : 1) - 1) * (+limit ? +limit : 10);
  return { sort, offset, limit };
};

export const encryptData = (text) => {
  const cipher = crypto.createCipher(
    "aes-256-cbc",
    configVariables.ENCRYPT_SECRET
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

export const decryptData = (encryptedText) => {
  const decipher = crypto.createDecipher(
    "aes-256-cbc",
    configVariables.ENCRYPT_SECRET
  );
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
