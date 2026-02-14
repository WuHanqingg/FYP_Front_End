import { vi } from "vitest";

vi.stubGlobal("import.meta", {
  env: {
    VITE_AMBIENT_API_KEY: "test-api-key",
    VITE_AMBIENT_APPLICATION_KEY: "test-application-key",
    VITE_ROUTER_HISTORY: "hash",
    VITE_PORT: "8848",
    VITE_PUBLIC_PATH: "/"
  }
});

const localStorageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
vi.stubGlobal("localStorage", localStorageMock);
