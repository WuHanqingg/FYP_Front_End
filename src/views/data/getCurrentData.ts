import { ref } from 'vue';
import { getToken, getCurrentData, getHistoryData } from "@/api/CloudPlatformApi/getData";
import cardData from "@/views/data/cardData";

export async function getWeatherData() {
  const token = await getToken()
  const res = token.data.token
  const response = await getCurrentData(res)
  return response.data
}

export async function getYesterdayData() {
  const token = await getToken()
  const authToken = token.data.token
  const startTs = Date.now() - 48 * 60 * 60 * 1000
  const endTs = Date.now()
  const res = ref({})
  const ids = ref([])
  for (let item of cardData.environmentData) {
    ids.value.push(item.id)
  }
  for (let i of cardData.environmentData) {
    const yesterdayValue = ref({})
    yesterdayValue.value = await getHistoryData(i.id, startTs, endTs, 0, 1440, 'NONE', authToken)
    res.value[i.id] = yesterdayValue.value[0]
  }
  //res.value = await getHistoryData(ids.value, startTs, endTs, 0, 1440, 'NONE', authToken)
}