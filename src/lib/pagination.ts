export interface PaginationState {
  basePath: string;
  // Routes use zero-based indices; visible page numbers start at one.
  currentPage: number;
  totalPages: number;
}

export const paginationPages = (
  currentPage: number,
  totalPages: number,
): (number | "ellipsis")[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index);
  }
  if (currentPage <= 3) {
    return [0, 1, 2, 3, 4, "ellipsis", totalPages - 1];
  }
  if (currentPage >= totalPages - 4) {
    return [
      0,
      "ellipsis",
      totalPages - 5,
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
    ];
  }
  return [
    0,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    totalPages - 1,
  ];
};
