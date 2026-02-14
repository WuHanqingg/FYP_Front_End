import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";

vi.mock("../../utils", () => ({
  store: undefined,
  storageLocal: () => ({
    getItem: vi.fn(() => ({})),
    setItem: vi.fn()
  }),
  responsiveStorageNameSpace: () => "test_"
}));

import {
  useDataSourceStore,
  DATA_SOURCE_OPTIONS
} from "../dataSource";

describe("DataSource Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe("initial state", () => {
    it("should have cloudPlatform as default source", () => {
      const store = useDataSourceStore();
      expect(store.getCurrentSource).toBe("cloudPlatform");
    });

    it("should not be loading initially", () => {
      const store = useDataSourceStore();
      expect(store.getIsLoading).toBe(false);
    });

    it("should have no error initially", () => {
      const store = useDataSourceStore();
      expect(store.getError).toBeNull();
    });

    it("should have no lastUpdated initially", () => {
      const store = useDataSourceStore();
      expect(store.getLastUpdated).toBeNull();
    });
  });

  describe("DATA_SOURCE_OPTIONS", () => {
    it("should have two data source options", () => {
      expect(DATA_SOURCE_OPTIONS).toHaveLength(2);
    });

    it("should contain cloudPlatform option", () => {
      const option = DATA_SOURCE_OPTIONS.find(o => o.value === "cloudPlatform");
      expect(option).toBeDefined();
      expect(option?.label).toBe("Cloud Platform");
    });

    it("should contain ambientWeather option", () => {
      const option = DATA_SOURCE_OPTIONS.find(o => o.value === "ambientWeather");
      expect(option).toBeDefined();
      expect(option?.label).toBe("Ambient Weather");
    });
  });

  describe("setDataSource", () => {
    it("should change the current source", () => {
      const store = useDataSourceStore();
      store.setDataSource("ambientWeather");
      expect(store.getCurrentSource).toBe("ambientWeather");
    });

    it("should clear error when changing source", () => {
      const store = useDataSourceStore();
      store.setError("Test error");
      store.setDataSource("ambientWeather");
      expect(store.getError).toBeNull();
    });
  });

  describe("setLoading", () => {
    it("should set loading state", () => {
      const store = useDataSourceStore();
      store.setLoading(true);
      expect(store.getIsLoading).toBe(true);
    });
  });

  describe("setError", () => {
    it("should set error message", () => {
      const store = useDataSourceStore();
      store.setError("Test error");
      expect(store.getError).toBe("Test error");
    });
  });

  describe("setLastUpdated", () => {
    it("should set last updated timestamp", () => {
      const store = useDataSourceStore();
      const timestamp = Date.now();
      store.setLastUpdated(timestamp);
      expect(store.getLastUpdated).toBe(timestamp);
    });
  });

  describe("preserveState and restoreState", () => {
    it("should preserve and restore state", () => {
      const store = useDataSourceStore();
      const preservedData = {
        pagination: { current: 2, pageSize: 24 },
        searchValue: "test",
        dateRange: null as [string, string] | null,
        chartDataType: "temperature",
        chartType: "bar",
        interval: 60000
      };

      store.preserveState(preservedData);
      const restored = store.restoreState();

      expect(restored.pagination).toEqual(preservedData.pagination);
      expect(restored.searchValue).toBe(preservedData.searchValue);
      expect(restored.chartDataType).toBe(preservedData.chartDataType);
      expect(restored.chartType).toBe(preservedData.chartType);
      expect(restored.interval).toBe(preservedData.interval);
    });

    it("should merge preserved state with existing state", () => {
      const store = useDataSourceStore();

      store.preserveState({ searchValue: "first" });
      store.preserveState({ chartDataType: "humidity" });

      const restored = store.restoreState();
      expect(restored.searchValue).toBe("first");
      expect(restored.chartDataType).toBe("humidity");
    });
  });

  describe("clearError", () => {
    it("should clear error", () => {
      const store = useDataSourceStore();
      store.setError("Test error");
      store.clearError();
      expect(store.getError).toBeNull();
    });
  });

  describe("switchDataSource", () => {
    it("should switch to new source", async () => {
      const store = useDataSourceStore();
      await store.switchDataSource("ambientWeather");
      expect(store.getCurrentSource).toBe("ambientWeather");
    });

    it("should not switch if source is the same", async () => {
      const store = useDataSourceStore();
      const initialSource = store.getCurrentSource;
      await store.switchDataSource(initialSource);
      expect(store.getCurrentSource).toBe(initialSource);
    });

    it("should reset loading state after switch completes", async () => {
      const store = useDataSourceStore();
      await store.switchDataSource("ambientWeather");
      expect(store.getIsLoading).toBe(false);
    });

    it("should update lastUpdated timestamp after switch", async () => {
      const store = useDataSourceStore();
      await store.switchDataSource("ambientWeather");
      expect(store.getLastUpdated).not.toBeNull();
    });
  });

  describe("getCurrentSourceOption", () => {
    it("should return current source option", () => {
      const store = useDataSourceStore();
      const option = store.getCurrentSourceOption;
      expect(option?.value).toBe("cloudPlatform");
    });

    it("should return correct option after switch", () => {
      const store = useDataSourceStore();
      store.setDataSource("ambientWeather");
      const option = store.getCurrentSourceOption;
      expect(option?.value).toBe("ambientWeather");
    });
  });
});
