import { useEffect, useMemo, useState } from "react";

/** Client-side pagination over an already-filtered row array.
 *
 * A hook, so it lives in hooks/ rather than beside the PaginationBar
 * component — a module that exports both a component and a hook breaks
 * React Fast Refresh for every screen that imports it. */
export function usePagination<T>(rows: T[], initialSize = 50) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialSize);
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  // Back to page 1 whenever the underlying list changes size (filter/search/add/delete)
  useEffect(() => {
    setPage(1);
  }, [total]);

  const paged = useMemo(
    () => rows.slice((safePage - 1) * pageSize, safePage * pageSize),
    [rows, safePage, pageSize],
  );

  return { paged, page: safePage, setPage, pageSize, setPageSize, totalPages, total };
}
