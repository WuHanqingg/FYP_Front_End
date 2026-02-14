import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { DeviceLastData, Device, DeviceDataPoint } from "../types";

vi.mock("../apiKeys", () => ({
  API_KEY_LIST: ["test-api-key-1", "test-api-key-2", "test-api-key-3"],
  APPLICATION_KEY_LIST: ["test-app-key-1", "test-app-key-2"]
}));

vi.mock("../request", () => {
  const createAmbientWeatherError = (message: string, code: string) => {
    const error = new Error(message) as Error & { code: string };
    error.code = code;
    return error;
  };

  return {
    fetchWithRetry: vi.fn(async <T>(endpoint: string): Promise<T> => {
      if (endpoint === "/devices") {
        return [] as T;
      }
      return [] as T;
    }),
    concurrentBatchFetch: vi.fn(async <T>(): Promise<T[]> => {
      return [];
    }),
    createAmbientWeatherError
  };
});

import {
  transformToUnifiedFormat,
  getUserDevices,
  getDeviceData,
  getLatestDeviceData,
  getWeatherDataFromAmbient,
  getHistoryWeatherDataFromAmbient
} from "../index";

describe("Ambient Weather API", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("transformToUnifiedFormat", () => {
    it("should convert temperature from Fahrenheit to Celsius", () => {
      const data: DeviceLastData = {
        dateutc: 1515436500000,
        date: "2018-01-08T18:35:00.000Z",
        tempf: 66.9
      };

      const result = transformToUnifiedFormat(data);

      expect(result.ambientTemperature).toBeCloseTo(19.39, 1);
      expect(result.timestamp).toBe(1515436500000);
      expect(result.date).toBe("2018-01-08T18:35:00.000Z");
    });

    it("should convert wind speed from mph to m/s", () => {
      const data: DeviceLastData = {
        dateutc: 1515436500000,
        date: "2018-01-08T18:35:00.000Z",
        windspeedmph: 10
      };

      const result = transformToUnifiedFormat(data);

      expect(result.windSpeed).toBeCloseTo(4.47, 1);
    });

    it("should convert pressure from inHg to kPa", () => {
      const data: DeviceLastData = {
        dateutc: 1515436500000,
        date: "2018-01-08T18:35:00.000Z",
        baromrelin: 30.05
      };

      const result = transformToUnifiedFormat(data);

      expect(result.pressure).toBeCloseTo(101.76, 0);
    });

    it("should convert rainfall from inches to mm", () => {
      const data: DeviceLastData = {
        dateutc: 1515436500000,
        date: "2018-01-08T18:35:00.000Z",
        hourlyrainin: 0.5
      };

      const result = transformToUnifiedFormat(data);

      expect(result.rainfall).toBeCloseTo(12.7, 1);
    });

    it("should keep humidity as is", () => {
      const data: DeviceLastData = {
        dateutc: 1515436500000,
        date: "2018-01-08T18:35:00.000Z",
        humidity: 65
      };

      const result = transformToUnifiedFormat(data);

      expect(result.ambientHumidity).toBe(65);
    });

    it("should keep wind direction as is", () => {
      const data: DeviceLastData = {
        dateutc: 1515436500000,
        date: "2018-01-08T18:35:00.000Z",
        winddir: 180
      };

      const result = transformToUnifiedFormat(data);

      expect(result.windDirection).toBe(180);
    });

    it("should handle all fields together", () => {
      const data: DeviceLastData = {
        dateutc: 1515436500000,
        date: "2018-01-08T18:35:00.000Z",
        tempf: 66.9,
        humidity: 30,
        baromrelin: 30.05,
        windspeedmph: 0.9,
        winddir: 58,
        hourlyrainin: 0,
        feelsLike: 66.9,
        dewPoint: 34.45,
        windgustmph: 4,
        maxdailygust: 5
      };

      const result = transformToUnifiedFormat(data);

      expect(result.ambientTemperature).toBeDefined();
      expect(result.ambientHumidity).toBe(30);
      expect(result.pressure).toBeDefined();
      expect(result.windSpeed).toBeDefined();
      expect(result.windDirection).toBe(58);
      expect(result.rainfall).toBeDefined();
      expect(result.feelsLike).toBeDefined();
      expect(result.dewPoint).toBeDefined();
      expect(result.windGust).toBeDefined();
      expect(result.maxDailyGust).toBeDefined();
    });

    it("should handle empty data", () => {
      const data: DeviceLastData = {
        dateutc: 1515436500000,
        date: "2018-01-08T18:35:00.000Z"
      };

      const result = transformToUnifiedFormat(data);

      expect(result.timestamp).toBe(1515436500000);
      expect(result.date).toBe("2018-01-08T18:35:00.000Z");
      expect(result.ambientTemperature).toBeUndefined();
      expect(result.ambientHumidity).toBeUndefined();
    });
  });

  describe("getUserDevices", () => {
    it("should call fetchWithRetry with correct endpoint", async () => {
      const mockDevices: Device[] = [
        {
          macAddress: "00:00:00:00:00:00",
          info: { name: "Test Weather Station" },
          lastData: { dateutc: 1515436500000, date: "2018-01-08T18:35:00.000Z", tempf: 66.9 },
          apiKey: "test-api-key"
        }
      ];

      const requestModule = await import("../request");
      vi.mocked(requestModule.fetchWithRetry).mockResolvedValueOnce(mockDevices);

      const result = await getUserDevices();

      expect(requestModule.fetchWithRetry).toHaveBeenCalledWith("/devices", {}, 30000, 3);
      expect(result).toEqual(mockDevices);
    });
  });

  describe("getDeviceData", () => {
    it("should throw error when macAddress is not provided", async () => {
      await expect(getDeviceData("")).rejects.toThrow();
    });

    it("should call fetchWithRetry with correct parameters", async () => {
      const mockData: DeviceDataPoint[] = [
        {
          macAddress: "00:00:00:00:00:00",
          dateutc: 1515436500000,
          date: "2018-01-08T18:35:00.000Z",
          tempf: 66.9
        }
      ];

      const requestModule = await import("../request");
      vi.mocked(requestModule.fetchWithRetry).mockResolvedValueOnce(mockData);

      await getDeviceData("00:00:00:00:00:00", { limit: 100 });

      expect(requestModule.fetchWithRetry).toHaveBeenCalledWith(
        "/devices/00:00:00:00:00:00",
        { limit: 100 },
        30000,
        3
      );
    });
  });

  describe("getLatestDeviceData", () => {
    it("should return the latest data point", async () => {
      const mockData: DeviceDataPoint[] = [
        {
          macAddress: "00:00:00:00:00:00",
          dateutc: 1515436500000,
          date: "2018-01-08T18:35:00.000Z",
          tempf: 66.9
        }
      ];

      const requestModule = await import("../request");
      vi.mocked(requestModule.fetchWithRetry).mockResolvedValueOnce(mockData);

      const result = await getLatestDeviceData("00:00:00:00:00:00");

      expect(result).toEqual(mockData[0]);
    });

    it("should return null when no data is available", async () => {
      const requestModule = await import("../request");
      vi.mocked(requestModule.fetchWithRetry).mockResolvedValueOnce([]);

      const result = await getLatestDeviceData("00:00:00:00:00:00");

      expect(result).toBeNull();
    });
  });

  describe("getWeatherDataFromAmbient", () => {
    it("should return unified weather data", async () => {
      const mockDevices: Device[] = [
        {
          macAddress: "00:00:00:00:00:00",
          info: { name: "Test Weather Station" },
          lastData: {
            dateutc: 1515436500000,
            date: "2018-01-08T18:35:00.000Z",
            tempf: 66.9,
            humidity: 30,
            windspeedmph: 5
          },
          apiKey: "test-api-key"
        }
      ];

      const requestModule = await import("../request");
      vi.mocked(requestModule.fetchWithRetry).mockResolvedValueOnce(mockDevices);

      const result = await getWeatherDataFromAmbient();

      expect(result).toBeDefined();
      expect(result?.ambientTemperature).toBeDefined();
      expect(result?.ambientHumidity).toBe(30);
      expect(result?.windSpeed).toBeDefined();
    });

    it("should return null when no devices are available", async () => {
      const requestModule = await import("../request");
      vi.mocked(requestModule.fetchWithRetry).mockResolvedValueOnce([]);

      const result = await getWeatherDataFromAmbient();

      expect(result).toBeNull();
    });
  });

  describe("getHistoryWeatherDataFromAmbient", () => {
    it("should call concurrentBatchFetch when startTs and endTs provided", async () => {
      const mockData: DeviceDataPoint[] = [
        {
          macAddress: "00:00:00:00:00:00",
          dateutc: 1515436500000,
          date: "2018-01-08T18:35:00.000Z",
          tempf: 66.9
        }
      ];

      const requestModule = await import("../request");
      vi.mocked(requestModule.fetchWithRetry).mockResolvedValueOnce([
        { macAddress: "00:00:00:00:00:00", info: { name: "Test" } }
      ] as Device[]);
      vi.mocked(requestModule.concurrentBatchFetch).mockResolvedValueOnce(mockData);

      const result = await getHistoryWeatherDataFromAmbient(undefined, {
        startTs: 1515430000000,
        endTs: 1515440000000,
        limit: 1000
      });

      expect(requestModule.concurrentBatchFetch).toHaveBeenCalled();
      expect(result.length).toBe(1);
    });
  });
});
