import type { DataSourceType } from "@/store/modules/dataSource";
import { getWeatherData as getCloudPlatformWeatherData } from "@/api/CloudPlatformApi/getCurrentData";
import { getHistoryData as getCloudPlatformHistoryData } from "@/api/CloudPlatformApi/getCurrentData";
import {
  getWeatherDataFromAmbient,
  getHistoryWeatherDataFromAmbient,
  getUserDevices
} from "@/api/AmbientWeatherApi";
import type { UnifiedWeatherData } from "@/api/AmbientWeatherApi/types";

export interface WeatherDataResult {
  source: DataSourceType;
  data: Record<string, Array<{ ts?: number; value: number }>> | UnifiedWeatherData | null;
  timestamp: number;
}

export interface HistoryDataResult {
  source: DataSourceType;
  data: Array<{ time: string; value: number }>;
  timestamp: number;
}

export interface ProgressInfo {
  current: number;
  total: number;
  percentage: number;
}

export type ProgressCallback = (progress: ProgressInfo) => void;

const FIELD_MAPPING: Record<string, string> = {
  ambientTemperature: "ambientTemperature",
  ambientHumidity: "ambientHumidity",
  pressure: "pressure",
  windSpeed: "windSpeed",
  windDirection: "windDirection",
  rainfall: "rainfall",
  CO2: "CO2",
  PM10: "PM10",
  PM25: "PM25",
  RSSI: "RSSI",
  lightIntensity: "lightIntensity",
  pow: "pow"
};

const AMBIENT_TO_CLOUD_MAPPING: Record<string, string> = {
  ambientTemperature: "ambientTemperature",
  ambientHumidity: "ambientHumidity",
  pressure: "pressure",
  windSpeed: "windSpeed",
  windDirection: "windDirection",
  rainfall: "rainfall"
};

const CLOUD_TO_AMBIENT_MAPPING: Record<string, string> = {
  ambientTemperature: "ambientTemperature",
  ambientHumidity: "ambientHumidity",
  pressure: "pressure",
  windSpeed: "windSpeed",
  windDirection: "windDirection",
  rainfall: "rainfall"
};

export const fetchCurrentData = async (
  source: DataSourceType
): Promise<WeatherDataResult> => {
  const timestamp = Date.now();

  if (source === "cloudPlatform") {
    const data = await getCloudPlatformWeatherData();
    return { source, data, timestamp };
  } else {
    const data = await getWeatherDataFromAmbient();
    if (data) {
      const transformedData: Record<string, Array<{ value: number }>> = {};
      Object.entries(AMBIENT_TO_CLOUD_MAPPING).forEach(([ambientKey, cloudKey]) => {
        const value = data[ambientKey as keyof UnifiedWeatherData];
        if (value !== undefined && typeof value === "number") {
          transformedData[cloudKey] = [{ value }];
        }
      });
      return { source, data: transformedData, timestamp };
    }
    return { source, data: null, timestamp };
  }
};

export const fetchHistoryData = async (
  source: DataSourceType,
  dataType: string,
  startTs: number,
  endTs: number,
  interval = 0,
  limit = 43200,
  agg = "NONE",
  onProgress?: ProgressCallback
): Promise<HistoryDataResult> => {
  const timestamp = Date.now();

  if (source === "cloudPlatform") {
    const data = await getCloudPlatformHistoryData(
      dataType,
      startTs,
      endTs,
      interval,
      limit,
      agg
    );

    let formattedData: Array<{ time: string; value: number }> = [];

    if (data && data[dataType]) {
      formattedData = data[dataType]
        .map((item: { ts: number; value: string }) => ({
          time: new Date(item.ts).toISOString().slice(0, 16).replace("T", " "),
          value: parseFloat(item.value)
        }))
        .sort(
          (a: { time: string }, b: { time: string }) =>
            new Date(a.time).getTime() - new Date(b.time).getTime()
        );
    }

    return { source, data: formattedData, timestamp };
  } else {
    const ambientKey = CLOUD_TO_AMBIENT_MAPPING[dataType];

    if (!ambientKey) {
      console.warn(`Data type "${dataType}" is not supported by Ambient Weather API`);
      return { source, data: [], timestamp };
    }

    const devices = await getUserDevices();
    if (!devices || devices.length === 0) {
      return { source, data: [], timestamp };
    }

    const macAddress = devices[0].macAddress;

    const dataPoints = await getHistoryWeatherDataFromAmbient(macAddress, {
      startTs,
      endTs,
      limit,
      onProgress: onProgress
        ? (info) => {
            onProgress({
              current: info.completed,
              total: info.total,
              percentage: info.percentage
            });
          }
        : undefined
    });

    const formattedData = dataPoints
      .filter(point => point[ambientKey as keyof UnifiedWeatherData] !== undefined)
      .map(point => ({
        time: new Date(point.timestamp).toISOString().slice(0, 16).replace("T", " "),
        value: point[ambientKey as keyof UnifiedWeatherData] as number
      }))
      .filter(point => {
        const pointTime = new Date(point.time).getTime();
        return pointTime >= startTs && pointTime <= endTs;
      })
      .sort(
        (a: { time: string }, b: { time: string }) =>
          new Date(a.time).getTime() - new Date(b.time).getTime()
      );

    return { source, data: formattedData, timestamp };
  }
};

export const checkSourceAvailability = async (
  source: DataSourceType
): Promise<boolean> => {
  try {
    if (source === "cloudPlatform") {
      await getCloudPlatformWeatherData();
      return true;
    } else {
      await getUserDevices();
      return true;
    }
  } catch {
    return false;
  }
};

export const getSupportedDataTypes = (source: DataSourceType): string[] => {
  if (source === "cloudPlatform") {
    return Object.keys(FIELD_MAPPING);
  } else {
    return Object.keys(AMBIENT_TO_CLOUD_MAPPING);
  }
};

export { FIELD_MAPPING, AMBIENT_TO_CLOUD_MAPPING, CLOUD_TO_AMBIENT_MAPPING };
