import { getToken, getCurrentData, getHistoryData } from "@/api/CloudPlatformApi/getData";

export async function getWeatherData() {
  const token = await getToken()
  const res = token.data.token
  const response = await getCurrentData(res)
  return response.data
}

export async function getRainData(keys: string, startTs: number, endTs: number, interval: number, limit: number, agg: string) {
  const token = await getToken()
  const res = token.data.token
  const response = await getHistoryData(keys, startTs, endTs, interval, limit, agg, res)
  return response.data
}