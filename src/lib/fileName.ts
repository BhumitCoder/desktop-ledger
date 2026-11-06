import { fmtDate } from "@/lib/format";

/**
 * File names a person would have chosen.
 *
 * Every download used to name itself: "Statement-LOTUS", "items",
 * "bizdesk-backup-2026-11-06", or a bare bill number with no party, and the
 * CSV and Excel exports lowercased and hyphenated whatever they were given
 * ("profit-&-loss-2026-11-06.csv"). A statement a shop sends a customer on
 * WhatsApp arrives under that name. One rule, used everywhere:
 *
 *   What · Number – Party – Period      e.g.
 *   "Invoice INV-0747 - I-BELL MOBILE"
 *   "Statement - LOTUS - 01 Oct 2026 to 31 Oct 2026"
 */

/** Characters no file system accepts, plus control characters. */
// eslint-disable-next-line no-control-regex
const ILLEGAL = /[\\/:*?"<>|\u0000-\u001f]+/g;

/** A name safe on Windows, macOS, Android and iOS, case kept as written. */
export function safeFileName(name: string): string {
  const cleaned = (name ?? "")
    .replace(ILLEGAL, " ")
    .replace(/\s+/g, " ")
    .trim()
    // Windows refuses names ending in a dot or space.
    .replace(/[. ]+$/, "");
  return (cleaned || "Document").slice(0, 150).trim();
}

/** Join the parts that are present with " - ". */
export function fileName(...parts: (string | null | undefined | false)[]): string {
  return safeFileName(
    parts
      .map((p) => (typeof p === "string" ? p.trim() : ""))
      .filter(Boolean)
      .join(" - "),
  );
}

/** "01 Oct 2026 to 31 Oct 2026", "Up to …", "From …", or "" for all time. */
export function periodLabel(from?: string | null, to?: string | null): string {
  if (from && to) return `${fmtDate(from)} to ${fmtDate(to)}`;
  if (to) return `Up to ${fmtDate(to)}`;
  if (from) return `From ${fmtDate(from)}`;
  return "";
}
