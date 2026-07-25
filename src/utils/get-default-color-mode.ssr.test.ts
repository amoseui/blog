/**
 * @jest-environment node
 */
import getDefaultColorMode from "./get-default-color-mode";

describe("getDefaultColorMode", () => {
  test("successful return default color mode on ssr", () => {
    expect(typeof window).toBe("undefined");
    expect(getDefaultColorMode()).toBe("light");
  });
});
