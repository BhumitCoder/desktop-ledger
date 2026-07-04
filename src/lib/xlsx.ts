import * as XLSX from "xlsx";

export interface XlsxSheet {
  name: string;
  rows: (string | number)[][];
}

/** Excel sheet names must be ≤31 chars, unique, and can't contain : \ / ? * [ ] */
function safeSheetName(name: string, used: Set<string>): string {
  const base = name.replace(/[:\\/?*[\]]/g, " ").trim().slice(0, 31) || "Sheet";
  let candidate = base;
  let n = 2;
  while (used.has(candidate.toLowerCase())) {
    const suffix = ` (${n})`;
    candidate = `${base.slice(0, 31 - suffix.length)}${suffix}`;
    n++;
  }
  used.add(candidate.toLowerCase());
  return candidate;
}

/** Download a multi-sheet .xlsx workbook — one array-of-arrays sheet per entry.
 * Used for "one sheet per party" ledger exports, where a flat CSV can't
 * express separate sheets at all. */
export function downloadXlsx(filename: string, sheets: XlsxSheet[]) {
  const wb = XLSX.utils.book_new();
  const used = new Set<string>();
  for (const s of sheets) {
    const ws = XLSX.utils.aoa_to_sheet(s.rows);
    XLSX.utils.book_append_sheet(wb, ws, safeSheetName(s.name, used));
  }
  XLSX.writeFile(wb, `${filename.toLowerCase().replace(/\s+/g, "-")}.xlsx`);
}
