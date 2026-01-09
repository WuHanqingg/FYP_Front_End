import { ref } from "vue";
import {
  getToken,
  getCurrentData,
  getDataWithTimeStamp
} from "@/api/CloudPlatformApi/getData";
import cardData from "@/views/data/cardData";

export async function getWeatherData() {
  const token = await getToken();
  const res = token.data.token;
  const response = await getCurrentData(res);
  return response.data;
}

export async function getHistoryData(
  keys = "",
  startTs = Date.now(),
  endTs = Date.now(),
  interval = 0,
  limit = 1440,
  agg = "NONE"
) {
  const token = await getToken();
  const res = token.data.token;
  const response = await getDataWithTimeStamp(
    keys,
    startTs,
    endTs,
    interval,
    limit,
    agg,
    res
  );
  return response.data;
}
