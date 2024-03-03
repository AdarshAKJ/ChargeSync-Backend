import axios from "axios";
import { DEFAULT_HEADERS } from "../commons/global-constants";

export const callAPI = async (method, url, payload, customHeaders = {}) => {
  try {
    const response = await axios({
      method,
      url,
      data: payload,
      headers: { ...DEFAULT_HEADERS, ...customHeaders },
    });
    return response?.data; // data is inside this data
  } catch (error) {
    console.error("Called API Failed", error);
    console.error(error);
    throw error;
  }
};
