// 环境检测数据
export default {
  // 环境数据列表
  environmentData: [
    {
      id: "CO2",
      type: "CO2",
      unit: "ppm³",
      value: 400,
      yesterdayValue: 400,
      status: "normal" as const,
      icon: "mdi:molecule-co2", // 二氧化碳分子图标
      color: "#5B8FF9"
    },
    {
      id: "PM10",
      type: "PM10",
      unit: "μg/m³",
      value: 11,
      yesterdayValue: 11,
      status: "warning" as const,
      icon: "mdi:air-filter", // 空气过滤器图标
      color: "#FFAB38"
    },
    {
      id: "PM25",
      type: "PM25",
      unit: "μg/m³",
      value: 9,
      yesterdayValue: 9,
      status: "warning" as const,
      icon: "mdi:air-purifier", // 空气净化器图标
      color: "#FFAB38"
    },
    {
      id: "RSSI",
      type: "RSSI",
      unit: "dBm",
      value: -50,
      yesterdayValue: -50,
      status: "warning" as const,
      icon: "mdi:wifi-strength-2", // WiFi信号强度图标
      color: "#FFAB38"
    },
    {
      id: "ambientTemperature",
      type: "Temperature",
      unit: "°C",
      value: 24.5,
      yesterdayValue: 22.3,
      status: "normal" as const,
      icon: "mdi:thermometer", // 温度计图标
      color: "#FF7875"
    },
    {
      id: "ambientHumidity",
      type: "Humidity",
      unit: "%",
      value: 65,
      yesterdayValue: 70,
      status: "normal" as const,
      icon: "mdi:water-percent", // 水分百分比图标
      color: "#40A9FF"
    },
    {
      id: "lightIntensity",
      type: "Light Intensity",
      unit: "lux",
      value: 500,
      yesterdayValue: 480,
      status: "normal" as const,
      icon: "mdi:brightness-6", // 光照强度图标
      color: "#FFD632"
    },
    {
      id: "pow",
      type: "Power",
      unit: "V",
      value: 75,
      yesterdayValue: 68,
      status: "danger" as const,
      icon: "mdi:lightning-bolt", // 闪电图标
      color: "#FF4D4F"
    },
    {
      id: "pressure",
      type: "Pressure",
      unit: "KPa",
      value: 50,
      yesterdayValue: 50,
      status: "normal" as const,
      icon: "mdi:gauge", // 压力表图标
      color: "#73D13D"
    },
    {
      id: "rainfall",
      type: "Rainfall",
      unit: "mm",
      value: 0.45,
      yesterdayValue: 0.42,
      status: "normal" as const,
      icon: "mdi:weather-rainy", // 雨天图标
      color: "#B37FEB"
    },
    {
      id: "windDirection",
      type: "Wind Direction",
      unit: "°",
      value: 100,
      yesterdayValue: 100,
      status: "normal" as const,
      icon: "mdi:compass-rose", // 罗盘图标
      color: "#B37FEB"
    },
    {
      id: "windSpeed",
      type: "Wind Speed",
      unit: "m/s",
      value: 5,
      yesterdayValue: 5,
      status: "normal" as const,
      icon: "mdi:weather-windy", // 风速图标
      color: "#B37FEB"
    },
  ],

  // 原有的数据（如果需要保留）
  list: [
    {
      index: 1,
      isSetup: true,
      type: 4,
      banner: "https://tdesign.gtimg.com/tdesign-pro/cloud-server.jpg",
      name: "SSL证书",
      description:
        "SSL证书又叫服务器证书，腾讯云为您提供证书的一站式服务，包括免费、付费证书的申请、管理及部"
    },
    {
      index: 2,
      isSetup: true,
      type: 4,
      banner: "https://tdesign.gtimg.com/tdesign-pro/cloud-server.jpg",
      name: "SSL证书",
      description:
        "SSL证书又叫服务器证书，，包括免费、付费证书的申请、管理及部"
    },
  ]
};