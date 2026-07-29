import { expect, test } from "vitest";

import { paginate } from "./posts";

test("splits by limit preserving order", () => {
  const items = [1, 2, 3, 4, 5, 6, 7] as unknown as never[];
  const pages = paginate(items, 5);
  expect(pages).toHaveLength(2);
  expect(pages[0]).toHaveLength(5);
  expect(pages[1]).toHaveLength(2);
});
