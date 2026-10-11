import { expect, test } from "vitest";

import { paginationPages } from "./pagination";

test.each([
  { current: 0, total: 0, expected: [] },
  { current: 0, total: 1, expected: [0] },
  { current: 0, total: 6, expected: [0, 1, 2, 3, 4, 5] },
  { current: 5, total: 6, expected: [0, 1, 2, 3, 4, 5] },
  { current: 3, total: 7, expected: [0, 1, 2, 3, 4, 5, 6] },
  { current: 0, total: 8, expected: [0, 1, 2, 3, 4, "ellipsis", 7] },
  { current: 7, total: 8, expected: [0, "ellipsis", 3, 4, 5, 6, 7] },
  { current: 0, total: 20, expected: [0, 1, 2, 3, 4, "ellipsis", 19] },
  { current: 3, total: 20, expected: [0, 1, 2, 3, 4, "ellipsis", 19] },
  { current: 4, total: 20, expected: [0, "ellipsis", 3, 4, 5, "ellipsis", 19] },
  {
    current: 9,
    total: 20,
    expected: [0, "ellipsis", 8, 9, 10, "ellipsis", 19],
  },
  {
    current: 15,
    total: 20,
    expected: [0, "ellipsis", 14, 15, 16, "ellipsis", 19],
  },
  { current: 16, total: 20, expected: [0, "ellipsis", 15, 16, 17, 18, 19] },
  { current: 19, total: 20, expected: [0, "ellipsis", 15, 16, 17, 18, 19] },
])(
  "keeps a bounded page window for $current of $total",
  ({ current, total, expected }) => {
    expect(paginationPages(current, total)).toEqual(expected);
  },
);
