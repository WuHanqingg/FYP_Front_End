import axios, { type AxiosError } from "axios";
import type { AmbientWeatherError } from "./types";
import { API_KEY_LIST, APPLICATION_KEY_LIST } from "./apiKeys";

const isDevelopment = import.meta.env.DEV;

const AMBIENT_WEATHER_BASE_URL = isDevelopment
  ? "/ambient-api"
  : "https://api.ambientweather.net/v1";

const createAmbientWeatherError = (
  message: string,
  code: string,
  statusCode?: number,
  details?: unknown
): AmbientWeatherError => {
  const error = new Error(message) as AmbientWeatherError;
  error.code = code;
  error.statusCode = statusCode;
  error.details = details;
  error.name = "AmbientWeatherError";
  return error;
};

const createAxiosInstance = (timeout: number = 30000) => {
  return axios.create({
    baseURL: AMBIENT_WEATHER_BASE_URL,
    timeout,
    headers: {
      "Content-Type": "application/json"
    }
  });
};

const handleAxiosError = (error: AxiosError): AmbientWeatherError => {
  const statusCode = error.response?.status;
  const responseData = error.response?.data;

  let errorMessage = "An unknown error occurred";
  let errorCode = "UNKNOWN_ERROR";

  if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
    errorMessage = "Request timeout. Please try again.";
    errorCode = "TIMEOUT_ERROR";
  } else if (error.code === "ERR_NETWORK" || !error.response) {
    errorMessage = "Network error. Please check your connection.";
    errorCode = "NETWORK_ERROR";
  } else if (statusCode === 401) {
    errorMessage = "Invalid API key or application key.";
    errorCode = "UNAUTHORIZED";
  } else if (statusCode === 403) {
    errorMessage = "Access forbidden. Please check your permissions.";
    errorCode = "FORBIDDEN";
  } else if (statusCode === 429) {
    errorMessage = "Rate limit exceeded. Please wait a moment and try again.";
    errorCode = "RATE_LIMIT_EXCEEDED";
  } else if (statusCode && statusCode >= 500) {
    errorMessage = "Server error. Please try again later.";
    errorCode = "SERVER_ERROR";
  } else if (statusCode === 400) {
    errorMessage = "Bad request. Please check your parameters.";
    errorCode = "BAD_REQUEST";
  }

  return createAmbientWeatherError(errorMessage, errorCode, statusCode, responseData);
};

export interface KeyPair {
  apiKey: string;
  applicationKey: string;
  index: number;
}

export const getKeyPairs = (): KeyPair[] => {
  const pairs: KeyPair[] = [];
  let index = 0;

  const apiKeysPerAppKey = Math.ceil(API_KEY_LIST.length / APPLICATION_KEY_LIST.length);

  APPLICATION_KEY_LIST.forEach((appKey, appIndex) => {
    const startIdx = appIndex * apiKeysPerAppKey;
    const endIdx = Math.min(startIdx + apiKeysPerAppKey, API_KEY_LIST.length);

    for (let i = startIdx; i < endIdx; i++) {
      pairs.push({
        apiKey: API_KEY_LIST[i],
        applicationKey: appKey,
        index: index++
      });
    }
  });

  return pairs;
};

export interface BatchRequest {
  keyPair: KeyPair;
  endDate: Date;
  limit: number;
  batchIndex: number;
}

export interface BatchRequestResult<T> {
  data: T | null;
  request: BatchRequest;
  error: AmbientWeatherError | null;
  success: boolean;
  retries: number;
}

export interface ConcurrentBatchOptions {
  macAddress: string;
  startTs: number;
  endTs: number;
  limit: number;
  maxRetries?: number;
  timeout?: number;
  onProgress?: (info: { completed: number; total: number; percentage: number }) => void;
}

const executeBatchRequest = async <T>(
  request: BatchRequest,
  macAddress: string,
  timeout: number
): Promise<BatchRequestResult<T>> => {
  const instance = createAxiosInstance(timeout);

  try {
    const response = await instance.get(`/devices/${macAddress}`, {
      params: {
        apiKey: request.keyPair.apiKey,
        applicationKey: request.keyPair.applicationKey,
        endDate: request.endDate.toISOString(),
        limit: request.limit
      }
    });

    return {
      data: response.data as T,
      request,
      error: null,
      success: true,
      retries: 0
    };
  } catch (error) {
    const ambientError = error instanceof axios.AxiosError
      ? handleAxiosError(error)
      : createAmbientWeatherError("Unknown error occurred", "UNKNOWN_ERROR", undefined, error);

    return {
      data: null,
      request,
      error: ambientError,
      success: false,
      retries: 0
    };
  }
};

const executeBatchWithRetry = async <T>(
  request: BatchRequest,
  macAddress: string,
  timeout: number,
  maxRetries: number
): Promise<BatchRequestResult<T>> => {
  let lastError: AmbientWeatherError | null = null;
  let retries = 0;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const result = await executeBatchRequest<T>(request, macAddress, timeout);

    if (result.success) {
      return { ...result, retries: attempt };
    }

    lastError = result.error;
    retries = attempt;

    if (result.error?.code === "UNAUTHORIZED" || result.error?.code === "FORBIDDEN") {
      break;
    }

    if (attempt < maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return {
    data: null,
    request,
    error: lastError,
    success: false,
    retries
  };
};

export const concurrentBatchFetch = async <T extends { dateutc?: number }>(
  options: ConcurrentBatchOptions
): Promise<T[]> => {
  const {
    macAddress,
    startTs,
    endTs,
    limit,
    maxRetries = 3,
    timeout = 30000,
    onProgress
  } = options;

  const keyPairs = getKeyPairs();
  const DATA_INTERVAL_MS = 5 * 60 * 1000;
  const BATCH_LIMIT = 288;

  const timeRangeMs = endTs - startTs;
  const estimatedPoints = Math.ceil(timeRangeMs / DATA_INTERVAL_MS);
  const totalPointsNeeded = Math.min(estimatedPoints, limit);
  const numberOfBatches = Math.ceil(totalPointsNeeded / BATCH_LIMIT);

  const batches: BatchRequest[] = [];
  let currentEndDate = new Date(endTs);

  for (let i = 0; i < numberOfBatches; i++) {
    const keyPair = keyPairs[i % keyPairs.length];
    const batchLimit = Math.min(BATCH_LIMIT, totalPointsNeeded - i * BATCH_LIMIT);

    batches.push({
      keyPair,
      endDate: new Date(currentEndDate),
      limit: batchLimit,
      batchIndex: i
    });

    currentEndDate = new Date(currentEndDate.getTime() - batchLimit * DATA_INTERVAL_MS);
  }

  const allResults: BatchRequestResult<T[]>[] = [];
  let completedBatches = 0;

  const executeWithProgress = async (batch: BatchRequest): Promise<BatchRequestResult<T[]>> => {
    const result = await executeBatchWithRetry<T[]>(batch, macAddress, timeout, maxRetries);
    completedBatches++;
    onProgress?.({
      completed: completedBatches,
      total: batches.length,
      percentage: Math.round((completedBatches / batches.length) * 100)
    });
    return result;
  };

  const concurrencyLimit = keyPairs.length;

  for (let i = 0; i < batches.length; i += concurrencyLimit) {
    const batchGroup = batches.slice(i, i + concurrencyLimit);
    const groupResults = await Promise.all(batchGroup.map(executeWithProgress));
    allResults.push(...groupResults);
  }

  const allData: T[] = [];
  const seenTimestamps = new Set<number>();

  allResults.forEach(result => {
    if (result.success && result.data && Array.isArray(result.data)) {
      result.data.forEach(item => {
        if (item.dateutc !== undefined) {
          if (item.dateutc >= startTs && item.dateutc <= endTs && !seenTimestamps.has(item.dateutc)) {
            seenTimestamps.add(item.dateutc);
            allData.push(item);
          }
        }
      });
    }
  });

  return allData.sort((a, b) => (a.dateutc ?? 0) - (b.dateutc ?? 0));
};

export const fetchWithRetry = async <T>(
  endpoint: string,
  params: Record<string, unknown>,
  timeout: number = 30000,
  maxRetries: number = 3
): Promise<T> => {
  const keyPairs = getKeyPairs();
  let lastError: AmbientWeatherError | null = null;

  for (const keyPair of keyPairs) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const instance = createAxiosInstance(timeout);

      try {
        const response = await instance.get(endpoint, {
          params: {
            ...params,
            apiKey: keyPair.apiKey,
            applicationKey: keyPair.applicationKey
          }
        });

        return response.data as T;
      } catch (error) {
        lastError = error instanceof axios.AxiosError
          ? handleAxiosError(error)
          : createAmbientWeatherError("Unknown error", "UNKNOWN_ERROR", undefined, error);

        if (lastError.code === "UNAUTHORIZED" || lastError.code === "FORBIDDEN") {
          break;
        }

        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
  }

  throw lastError || createAmbientWeatherError("All requests failed", "ALL_REQUESTS_FAILED");
};

export { createAmbientWeatherError, AMBIENT_WEATHER_BASE_URL };
