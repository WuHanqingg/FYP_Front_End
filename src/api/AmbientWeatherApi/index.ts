import {
  fetchWithRetry,
  concurrentBatchFetch,
  createAmbientWeatherError
} from "./request";
import type {
  Device,
  DeviceDataPoint,
  DeviceLastData,
  UnifiedWeatherData,
  HistoryDataOptions,
  AmbientWeatherError
} from "./types";

const fahrenheitToCelsius = (fahrenheit: number): number => {
  return Number((((fahrenheit - 32) * 5) / 9).toFixed(2));
};

const mphToMs = (mph: number): number => {
  return Number((mph * 0.44704).toFixed(2));
};

const inchHgToKpa = (inchHg: number): number => {
  return Number((inchHg * 3.38639).toFixed(2));
};

const inchToMm = (inch: number): number => {
  return Number((inch * 25.4).toFixed(2));
};

export const transformToUnifiedFormat = (
  data: DeviceLastData | DeviceDataPoint
): UnifiedWeatherData => {
  const unified: UnifiedWeatherData = {
    timestamp: data.dateutc,
    date: data.date
  };

  if (data.tempf !== undefined) {
    unified.ambientTemperature = fahrenheitToCelsius(data.tempf);
  }

  if (data.humidity !== undefined) {
    unified.ambientHumidity = data.humidity;
  }

  if (data.baromrelin !== undefined) {
    unified.pressure = inchHgToKpa(data.baromrelin);
  }

  if (data.windspeedmph !== undefined) {
    unified.windSpeed = mphToMs(data.windspeedmph);
  }

  if (data.winddir !== undefined) {
    unified.windDirection = data.winddir;
  }

  if (data.hourlyrainin !== undefined) {
    unified.rainfall = inchToMm(data.hourlyrainin);
  }

  if (data.feelsLike !== undefined) {
    unified.feelsLike = fahrenheitToCelsius(data.feelsLike);
  }

  if (data.dewPoint !== undefined) {
    unified.dewPoint = fahrenheitToCelsius(data.dewPoint);
  }

  if (data.windgustmph !== undefined) {
    unified.windGust = mphToMs(data.windgustmph);
  }

  if (data.maxdailygust !== undefined) {
    unified.maxDailyGust = mphToMs(data.maxdailygust);
  }

  return unified;
};

export const getUserDevices = async (): Promise<Device[]> => {
  try {
    const data = await fetchWithRetry<Device[]>("/devices", {}, 30000, 3);

    if (!Array.isArray(data)) {
      throw createAmbientWeatherError(
        "Invalid response format from API",
        "INVALID_RESPONSE_FORMAT"
      );
    }

    return data;
  } catch (error) {
    const ambientError = error as AmbientWeatherError;
    if (ambientError.code) {
      throw error;
    }
    throw createAmbientWeatherError(
      "Failed to fetch devices",
      "FETCH_DEVICES_ERROR",
      undefined,
      error
    );
  }
};

export const getDeviceData = async (
  macAddress: string,
  options: HistoryDataOptions = {}
): Promise<DeviceDataPoint[]> => {
  if (!macAddress) {
    throw createAmbientWeatherError(
      "MAC address is required",
      "MISSING_MAC_ADDRESS"
    );
  }

  const { limit = 288, endDate } = options;

  try {
    const params: Record<string, unknown> = { limit };

    if (endDate) {
      params.endDate =
        typeof endDate === "string" ? endDate : endDate.toISOString();
    }

    const data = await fetchWithRetry<DeviceDataPoint[]>(
      `/devices/${macAddress}`,
      params,
      30000,
      3
    );

    if (!Array.isArray(data)) {
      throw createAmbientWeatherError(
        "Invalid response format from API",
        "INVALID_RESPONSE_FORMAT"
      );
    }

    return data;
  } catch (error) {
    const ambientError = error as AmbientWeatherError;
    if (ambientError.code) {
      throw error;
    }
    throw createAmbientWeatherError(
      `Failed to fetch data for device ${macAddress}`,
      "FETCH_DEVICE_DATA_ERROR",
      undefined,
      error
    );
  }
};

export const getLatestDeviceData = async (
  macAddress: string
): Promise<DeviceDataPoint | null> => {
  const data = await getDeviceData(macAddress, { limit: 1 });
  return data.length > 0 ? data[0] : null;
};

export const getWeatherDataFromAmbient =
  async (): Promise<UnifiedWeatherData | null> => {
    try {
      const devices = await getUserDevices();

      if (!devices || devices.length === 0) {
        return null;
      }

      const firstDevice = devices[0];
      const lastData = firstDevice.lastData;

      if (!lastData) {
        return null;
      }

      return transformToUnifiedFormat(lastData);
    } catch (error) {
      throw error;
    }
  };

export interface HistoryFetchOptions extends HistoryDataOptions {
  startTs?: number;
  endTs?: number;
  onProgress?: (info: { completed: number; total: number; percentage: number }) => void;
}

export const getHistoryWeatherDataFromAmbient = async (
  macAddress?: string,
  options?: HistoryFetchOptions
): Promise<UnifiedWeatherData[]> => {
  let targetMacAddress = macAddress;

  if (!targetMacAddress) {
    const devices = await getUserDevices();
    if (!devices || devices.length === 0) {
      return [];
    }
    targetMacAddress = devices[0].macAddress;
  }

  const { startTs, endTs, limit = 43200, onProgress } = options || {};

  if (startTs && endTs) {
    const dataPoints = await concurrentBatchFetch<DeviceDataPoint>({
      macAddress: targetMacAddress,
      startTs,
      endTs,
      limit,
      maxRetries: 3,
      timeout: 30000,
      onProgress
    });

    return dataPoints.map(transformToUnifiedFormat);
  }

  const data = await getDeviceData(targetMacAddress, { limit });
  return data.map(transformToUnifiedFormat);
};
