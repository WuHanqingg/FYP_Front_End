import { defineStore } from "pinia";
import { store, storageLocal, responsiveStorageNameSpace } from "../utils";

export type DataSourceType = "cloudPlatform" | "ambientWeather";

export interface DataSourceOption {
  value: DataSourceType;
  label: string;
  description: string;
  icon: string;
  status: "online" | "offline" | "unknown";
}

export interface DataSourceState {
  currentSource: DataSourceType;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  preservedState: {
    pagination: { current: number; pageSize: number };
    searchValue: string;
    dateRange: [string, string] | null;
    chartDataType: string;
    chartType: string;
    interval: number | null;
  };
}

export const DATA_SOURCE_OPTIONS: DataSourceOption[] = [
  {
    value: "cloudPlatform",
    label: "Cloud Platform",
    description: "School weather station data",
    icon: "mdi:cloud",
    status: "unknown"
  },
  {
    value: "ambientWeather",
    label: "Ambient Weather",
    description: "Personal weather station network",
    icon: "mdi:weather-partly-cloudy",
    status: "unknown"
  }
];

const STORAGE_KEY = `${responsiveStorageNameSpace()}dataSource`;

const getStoredSource = (): DataSourceType => {
  const stored = storageLocal().getItem<Record<string, unknown>>(STORAGE_KEY);
  return (stored?.currentSource as DataSourceType) || "cloudPlatform";
};

const setStoredSource = (source: DataSourceType) => {
  const stored = storageLocal().getItem<Record<string, unknown>>(STORAGE_KEY) || {};
  stored.currentSource = source;
  storageLocal().setItem(STORAGE_KEY, stored);
};

export const useDataSourceStore = defineStore("dataSource", {
  state: (): DataSourceState => ({
    currentSource: getStoredSource(),
    isLoading: false,
    error: null,
    lastUpdated: null,
    preservedState: {
      pagination: { current: 1, pageSize: 12 },
      searchValue: "",
      dateRange: null,
      chartDataType: "windDirection",
      chartType: "line",
      interval: null
    }
  }),

  getters: {
    getCurrentSource: state => state.currentSource,
    getIsLoading: state => state.isLoading,
    getError: state => state.error,
    getLastUpdated: state => state.lastUpdated,
    getPreservedState: state => state.preservedState,
    getCurrentSourceOption: state =>
      DATA_SOURCE_OPTIONS.find(opt => opt.value === state.currentSource)
  },

  actions: {
    setDataSource(source: DataSourceType) {
      if (source !== this.currentSource) {
        this.currentSource = source;
        setStoredSource(source);
        this.error = null;
      }
    },

    setLoading(loading: boolean) {
      this.isLoading = loading;
    },

    setError(error: string | null) {
      this.error = error;
    },

    setLastUpdated(timestamp: number) {
      this.lastUpdated = timestamp;
    },

    preserveState(state: Partial<DataSourceState["preservedState"]>) {
      this.preservedState = {
        ...this.preservedState,
        ...state
      };
    },

    restoreState() {
      return { ...this.preservedState };
    },

    clearError() {
      this.error = null;
    },

    async switchDataSource(newSource: DataSourceType) {
      if (newSource === this.currentSource) return;

      this.setLoading(true);
      this.setError(null);

      try {
        this.setDataSource(newSource);
        this.setLastUpdated(Date.now());
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to switch data source";
        this.setError(message);
        throw error;
      } finally {
        this.setLoading(false);
      }
    }
  }
});

export function useDataSourceStoreHook() {
  return useDataSourceStore(store);
}
