// 环境检测数据
export default {
  // 环境数据列表
  environmentData: [
    {
      id: "CO2",
      name: "CO2",
      unit: "ppm³",
      value: 400,
      threshold: 400,
      thresholdType: "above",
      icon: "mdi:molecule-co2" // 二氧化碳分子图标
    },
    {
      id: "PM10",
      name: "PM10",
      unit: "μg/m³",
      value: 11,
      threshold: 11,
      thresholdType: "above",
      icon: "mdi:air-filter" // 空气过滤器图标
    },
    {
      id: "PM25",
      name: "PM25",
      unit: "μg/m³",
      value: 9,
      threshold: 9,
      thresholdType: "above",
      icon: "mdi:air-purifier" // 空气净化器图标
    },
    {
      id: "RSSI",
      name: "RSSI",
      unit: "dBm",
      value: -50,
      threshold: 20,
      thresholdType: "below",
      icon: "mdi:wifi-strength-2" // WiFi信号强度图标
    },
    {
      id: "ambientTemperature",
      name: "Temperature",
      unit: "°C",
      value: 24.5,
      threshold: 22.3,
      thresholdType: "above",
      icon: "mdi:thermometer" // 温度计图标
    },
    {
      id: "ambientHumidity",
      name: "Humidity",
      unit: "%",
      value: 65,
      threshold: 70,
      thresholdType: "above",
      icon: "mdi:water-percent" // 水分百分比图标
    },
    {
      id: "lightIntensity",
      name: "Light Intensity",
      unit: "lux",
      value: 500,
      threshold: 11000,
      thresholdType: "above",
      icon: "mdi:brightness-6" // 光照强度图标
    },
    {
      id: "pow",
      name: "Power",
      unit: "V",
      value: 75,
      threshold: 68,
      thresholdType: "above",
      icon: "mdi:lightning-bolt" // 闪电图标
    },
    {
      id: "pressure",
      name: "Pressure",
      unit: "KPa",
      value: 50,
      threshold: 50,
      thresholdType: "above",
      icon: "mdi:gauge" // 压力表图标
    },
    {
      id: "rainfall",
      name: "Rainfall",
      unit: "mm",
      value: 0.45,
      threshold: 500,
      thresholdType: "above",
      icon: "mdi:weather-rainy" // 雨天图标
    },
    {
      id: "windDirection",
      name: "Wind Direction",
      unit: "°",
      value: 100,
      threshold: "none",
      thresholdType: "none",
      icon: "mdi:compass-rose" // 罗盘图标
    },
    {
      id: "windSpeed",
      name: "Wind Speed",
      unit: "m/s",
      value: 5,
      threshold: 5,
      thresholdType: "above",
      icon: "mdi:weather-windy" // 风速图标
    }
  ]
};
