import getDefaultColorMode from "./get-default-color-mode";

describe("getDefaultColorMode", () => {
  test("successful return color mode", () => {
    expect(getDefaultColorMode()).toBe("light");

    (window.matchMedia as jest.Mock).mockReturnValue({
      matches: true,
    });

    expect(getDefaultColorMode()).toBe("dark");

    (window.matchMedia as jest.Mock).mockReturnValue({});
    expect(getDefaultColorMode()).toBe("light");
  });
});
