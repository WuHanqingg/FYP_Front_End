export interface AmbientWeatherConfig {
  apiKey: string;
  applicationKey: string;
}

export interface DeviceInfo {
  name: string;
  location?: string;
  address?: string;
  elevation?: number;
  coords?: {
    coords: {
      lat: number;
      lon: number;
    };
    geo?: {
      type: string;
      coordinates: number[];
    };
  };
}

export interface DeviceLastData {
  dateutc: number;
  date: string;
  winddir?: number;
  windspeedmph?: number;
  windgustmph?: number;
  maxdailygust?: number;
  windgustdir?: number;
  winddir_avg2m?: number;
  windspdmph_avg2m?: number;
  winddir_avg10m?: number;
  windspdmph_avg10m?: number;
  tempf?: number;
  humidity?: number;
  baromrelin?: number;
  baromabsin?: number;
  tempinf?: number;
  humidityin?: number;
  hourlyrainin?: number;
  dailyrainin?: number;
  monthlyrainin?: number;
  yearlyrainin?: number;
  feelsLike?: number;
  dewPoint?: number;
  deviceId?: string;
  tz?: string;
}

export interface Device {
  macAddress: string;
  info: DeviceInfo;
  lastData: DeviceLastData;
  apiKey: string;
}

export interface SubscribedResponse {
  devices: Device[];
  invalidApiKeys?: string[];
  method: string;
}

export interface DeviceDataPoint {
  macAddress: string;
  dateutc: number;
  date: string;
  winddir?: number;
  windspeedmph?: number;
  windgustmph?: number;
  maxdailygust?: number;
  windgustdir?: number;
  winddir_avg2m?: number;
  windspdmph_avg2m?: number;
  winddir_avg10m?: number;
  windspdmph_avg10m?: number;
  tempf?: number;
  humidity?: number;
  baromrelin?: number;
  baromabsin?: number;
  tempinf?: number;
  humidityin?: number;
  hourlyrainin?: number;
  dailyrainin?: number;
  monthlyrainin?: number;
  yearlyrainin?: number;
  feelsLike?: number;
  dewPoint?: number;
  tz?: string;
  device?: {
    macAddress: string;
    info: DeviceInfo;
  };
}

export interface UnifiedWeatherData {
  ambientTemperature?: number;
  ambientHumidity?: number;
  pressure?: number;
  windSpeed?: number;
  windDirection?: number;
  rainfall?: number;
  feelsLike?: number;
  dewPoint?: number;
  windGust?: number;
  maxDailyGust?: number;
  timestamp: number;
  date: string;
}

export interface HistoryDataOptions {
  limit?: number;
  endDate?: string | Date;
}

export interface AmbientWeatherError extends Error {
  code: string;
  statusCode?: number;
  details?: unknown;
}

export type DataSourceType = "cloudPlatform" | "ambientWeather";

export interface WeatherDataResponse {
  source: DataSourceType;
  data: UnifiedWeatherData;
  raw?: DeviceLastData | DeviceDataPoint;
}
