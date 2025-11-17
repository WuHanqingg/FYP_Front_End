import { ref } from 'vue';
import { getToken, getCurrentData, getHistoryData } from "@/api/CloudPlatformApi/getData";
import cardData from "@/views/data/cardData"; 

export async function getWeatherData() {
  const token = await getToken()
  const res = token.data.token
  const response = await getCurrentData(res)
  return response.data
}
