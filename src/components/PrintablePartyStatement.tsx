import { fmtMoney, fmtDate } from "@/lib/format";
import type { PartyStatementRow } from "@/lib/ledger";
import type { Company, Party } from "@/types";

/**
 * A single party's statement, laid out for paper.
 *
 * Used by the bulk ledger export, which renders one of these per selected
 * party off-screen and turns each into its own PDF. It takes rows straight
 * from `buildPartyStatement` — the same function the on-screen statement
 * page uses — so the two can never disagree about the numbers, even though
 * the page has its own richer on-screen layout.
 */
export function PrintablePartyStatement({
  party,
  rows,
  company,
  periodLabel,
}: {
  party: Party;
  rows: PartyStatementRow[];
  company: Company;
  periodLabel: string;
}) {
  const closing = rows.length ? rows[rows.length - 1].balance : 0;
  const totalBilled = rows.reduce((s, r) => s + (r.total || 0), 0);
  const totalSettled = rows.reduce((s, r) => s + (r.receivedOrPaid || 0), 0);

  const th: React.CSSProperties = {
    padding: "6px 8px",
    borderBottom: "1.5px solid #111",
    fontSize: 11,
    fontWeight: 700,
    textAlign: "left",
    whiteSpace: "nowrap",
  };
  const td: React.CSSProperties = {
    padding: "5px 8px",
    borderBottom: "1px solid #e5e7eb",
    fontSize: 11,
  };
  const num: React.CSSProperties = {
    ...td,
    textAlign: "right",
    fontVariantNumeric: "tabular-nums",
  };

  return (
    <div
      style={{
        background: "#fff",
        color: "#111",
        padding: 24,
        width: 900,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{company.name}</div>
          {company.address && <div style={{ fontSize: 11, color: "#555" }}>{company.address}</div>}
          {company.phone && <div style={{ fontSize: 11, color: "#555" }}>Ph: {company.phone}</div>}
          {company.gstin && (
            <div style={{ fontSize: 11, color: "#555" }}>GSTIN: {company.gstin}</div>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>Party Statement</div>
          <div style={{ fontSize: 11, color: "#555" }}>{periodLabel}</div>
          <div style={{ fontSize: 11, color: "#555" }}>
            Generated {fmtDate(new Date().toISOString())}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 14, padding: "8px 10px", background: "#f6f7f9", borderRadius: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{party.name}</div>
        <div style={{ fontSize: 11, color: "#555" }}>
          {party.phone ? `Ph: ${party.phone}` : "Ph: —"}
          {party.gstin ? ` · GSTIN: ${party.gstin}` : ""}
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
        <thead>
          <tr>
            <th style={{ ...th, width: 80 }}>Date</th>
            <th style={th}>Transaction</th>
            <th style={th}>Ref No.</th>
            <th style={{ ...th, textAlign: "right", width: 100 }}>Total</th>
            <th style={{ ...th, textAlign: "right", width: 110 }}>Received / Paid</th>
            <th style={{ ...th, textAlign: "right", width: 110 }}>Balance</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={`${r.docId ?? r.type}-${i}`}>
              <td style={td}>{r.date ? fmtDate(r.date) : "—"}</td>
              <td style={td}>
                {r.type}
                {r.status ? ` (${r.status})` : ""}
              </td>
              <td style={td}>{r.ref || "—"}</td>
              <td style={num}>{r.total ? fmtMoney(r.total) : "—"}</td>
              <td style={num}>{r.receivedOrPaid ? fmtMoney(r.receivedOrPaid) : "—"}</td>
              <td style={{ ...num, fontWeight: 600 }}>{fmtMoney(r.balance)}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td style={{ ...td, textAlign: "center", color: "#777" }} colSpan={6}>
                No transactions in this period
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <td style={{ ...td, borderTop: "1.5px solid #111", fontWeight: 700 }} colSpan={3}>
              Total
            </td>
            <td style={{ ...num, borderTop: "1.5px solid #111", fontWeight: 700 }}>
              {fmtMoney(totalBilled)}
            </td>
            <td style={{ ...num, borderTop: "1.5px solid #111", fontWeight: 700 }}>
              {fmtMoney(totalSettled)}
            </td>
            <td style={{ ...num, borderTop: "1.5px solid #111", fontWeight: 800 }}>
              {fmtMoney(closing)}
            </td>
          </tr>
        </tfoot>
      </table>

      <div style={{ marginTop: 14, fontSize: 12, fontWeight: 700 }}>
        Closing balance: {fmtMoney(Math.abs(closing))}{" "}
        <span style={{ fontWeight: 500, color: "#555" }}>
          {closing > 0.01 ? "(receivable)" : closing < -0.01 ? "(payable)" : "(settled)"}
        </span>
      </div>
    </div>
  );
}
