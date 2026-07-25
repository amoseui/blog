import { localStorageMock, matchMediaMock } from "@/mocks";

// Guard for tests running in the node environment (e.g. SSR tests)
if (typeof window !== "undefined") {
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock(),
  });

  Object.defineProperty(window, "matchMedia", {
    value: matchMediaMock(),
  });
}

jest.mock("gatsby", () => jest.requireActual("./__mocks__/gatsby").default);
