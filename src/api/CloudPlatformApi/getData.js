import request from "./request";
//CloudPlatformApi文件夹下的所有接口都是获取学校老网站“云平台”用的，前缀的cloud是vite里跨域用的

export function getToken() {
  return request({
    url: "/cloud/api/auth/login",
    method: "post",
    data: {
      username: "sdashdjsh@qq.com",
      password: "123456"
    }
  });
}

export function getCurrentData(token) {
  return request({
    url: "/cloud/api/plugins/telemetry/DEVICE/6c6071d0-ab09-11ef-9997-e74fb9bc8ab0/values/timeseries?keys=ambientHumidity,ambientTemperature,pow,pressure,RSSI,PM10,windSpeed,CO2,rainfall,windDirection,lightIntensity,PM25",
    method: "get",
    headers: {
      Authorization: `Bearer ` + token
    }
  });
}

export function getDataWithTimeStamp(
  keys = "",
  startTs = Date.now(),
  endTs = Date.now(),
  interval = 0,
  limit = 1440,
  agg = "NONE",
  token
) {
  return request({
    url: `/cloud/api/plugins/telemetry/DEVICE/6c6071d0-ab09-11ef-9997-e74fb9bc8ab0/values/timeseries?keys=${keys}&startTs=${startTs}&endTs=${endTs}&interval=${interval}&limit=${limit}&agg=${agg}`,
    method: "get",
    headers: {
      Authorization: `Bearer ` + token
    }
  });
}
