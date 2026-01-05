// 图表数据配置
export default {
  chartDataType: [
    { label: "CO2", value: "CO2Data" },
    { label: "PM10", value: "PM10Data" },
    { label: "PM2.5", value: "PM25Data" },
    { label: "RSSI", value: "RSSIData" },
    { label: "Temperature", value: "ambientTemperatureData" },
    { label: "Humidity", value: "ambientHumidityData" },
    { label: "Light Intensity", value: "lightIntensityData" },
    { label: "Power", value: "powData" },
    { label: "Pressure", value: "pressureData" },
    { label: "Rainfall", value: "rainfallData" },
    { label: "Wind Direction", value: "windDirectionData" },
    { label: "Wind Speed", value: "windSpeedData" }
  ],
  intervalOptions: [
    { label: "5min", value: 5 * 60 * 1000 },
    { label: "10min", value: 10 * 60 * 1000 },
    { label: "30min", value: 30 * 60 * 1000 },
    { label: "1h", value: 60 * 60 * 1000 },
    { label: "2h", value: 2 * 60 * 60 * 1000 },
    { label: "6h", value: 6 * 60 * 60 * 1000 },
    { label: "12h", value: 12 * 60 * 60 * 1000 },
    { label: "1d", value: 24 * 60 * 60 * 1000 },
    { label: "Custom", value: -1 } // 自定义选项
  ],
  // 二氧化碳数据
  CO2Data: {
    title: "CO2 Concentration",
    unit: "ppm³",
    seriesName: "CO2",
    apiRequestName: "CO2",
    label: "CO2",
    value: "CO2Data",
    color: "#52c41a" // 绿色
  },
  // PM10数据
  PM10Data: {
    title: "PM10 Concentration",
    unit: "μg/m³",
    seriesName: "PM10",
    apiRequestName: "PM10",
    label: "PM10",
    value: "PM10Data",
    color: "#faad14" // 黄色
  },
  // PM2.5数据
  PM25Data: {
    title: "PM2.5 Concentration",
    unit: "μg/m³",
    seriesName: "PM2.5",
    apiRequestName: "PM25",
    label: "PM2.5",
    value: "PM25Data",
    color: "#f5222d" // 橙色
  },
  // RSSI信号强度
  RSSIData: {
    title: "RSSI Signal Strength",
    unit: "dBm",
    seriesName: "RSSI",
    apiRequestName: "RSSI",
    label: "RSSI",
    value: "RSSIData",
    color: "#1890ff" // 蓝色
  },
  // 环境温度
  ambientTemperatureData: {
    title: "Temperature",
    unit: "°C",
    seriesName: "Temperature",
    apiRequestName: "ambientTemperature",
    label: "Temperature",
    value: "ambientTemperatureData",
    color: "#ff4d4f" // 红色
  },
  // 环境湿度
  ambientHumidityData: {
    title: "Humidity",
    unit: "%",
    seriesName: "Humidity",
    apiRequestName: "ambientHumidity",
    label: "Humidity",
    value: "ambientHumidityData",
    color: "#13c2c2" // 青色
  },
  // 光照强度
  lightIntensityData: {
    title: "Light Intensity",
    unit: "lux",
    seriesName: "Light Intensity",
    apiRequestName: "lightIntensity",
    label: "Light Intensity",
    value: "lightIntensityData",
    color: "#722ed1" // 紫色
  },
  // 功率
  powData: {
    title: "Power",
    unit: "V",
    seriesName: "Power",
    apiRequestName: "pow",
    label: "Power",
    value: "powData",
    color: "#eb2f96" // 粉色
  },
  // 压力
  pressureData: {
    title: "Air Pressure",
    unit: "KPa",
    seriesName: "Pressure",
    apiRequestName: "pressure",
    label: "Pressure",
    value: "pressureData",
    color: "#001529" // 深蓝色
  },
  // 降雨量
  rainfallData: {
    title: "Rainfall",
    unit: "mm",
    seriesName: "Rainfall",
    apiRequestName: "rainfall",
    label: "Rainfall",
    value: "rainfallData",
    color: "#69c0ff" // 浅蓝色
  },
  // 风向数据
  windDirectionData: {
    title: "Wind Direction",
    unit: "Angle(°)",
    seriesName: "Wind Direction",
    apiRequestName: "windDirection",
    label: "Wind Direction",
    value: "windDirectionData",
    color: "#95de64" // 浅绿色
  },
  // 风速数据
  windSpeedData: {
    title: "Wind Speed",
    unit: "m/s",
    seriesName: "Wind Speed",
    apiRequestName: "windSpeed",
    label: "Wind Speed",
    value: "windSpeedData",
    color: "#73d13d" // 棕色
  }
};
