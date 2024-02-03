import dotenv from "dotenv";
import { sign, verify } from "jsonwebtoken";
import config from '../../config'

dotenv.config();

const jwtOption = {
  // eslint-disable-next-line no-undef
  expiresIn: config.EXPIRED_IN || "1d",
};

const refreshJwtOption = {
  // eslint-disable-next-line no-undef
  expiresIn: config.REFRESH_EXPIRED_IN || "1y",
};

export function getJwt(data) {
  // eslint-disable-next-line no-undef
  return sign(data, config.JWT_SECRET_KEY, jwtOption);
}

export function getShortJwt(data) {
  // eslint-disable-next-line no-undef
  return sign(data, 'asaefasacsae', {
    expiresIn: '1h'
  });
}


export async function verifyShortJwt(authorization) {
  // eslint-disable-next-line no-undef
  const token = await verify(authorization, 'asaefasacsae');
  return token;
}

export function getRefreshJwt(data) {
  // eslint-disable-next-line no-undef
  return sign(data, config.JWT_SECRET_KEY, refreshJwtOption);
}

export async function verifyJwt(authorization) {
  // eslint-disable-next-line no-undef
  const token = await verify(authorization, config.JWT_SECRET_KEY);
  return token;
}
