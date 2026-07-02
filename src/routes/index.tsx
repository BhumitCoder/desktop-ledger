import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  SalesRepo,
  PurchaseRepo,
  PartyRepo,
  ItemRepo,
  ExpenseRepo,
  BankRepo,
  PaymentRepo,
} from "@/repositories";
import { fmtMoney } from "@/lib/format";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  ChevronDown,
  FileText,
  LayoutList,
  BookOpen,
  Users,
  Plus,
  Package,
  TrendingUp,
} from "lucide-react";

export const Route = createFileRoute("/")({ component: Dashboard });

type Period = "this_month" | "last_month" | "this_year";

function getPeriodRange(period: Period): { start: Date; end: Date; label: string } {
  const now = new Date();
  if (period === "this_month") {
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      label: "This Month",
    };
  }
  if (period === "last_month") {
    return {
      start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      end: new Date(now.getFullYear(), now.getMonth(), 0),
      label: "Last Month",
    };
  }
  return {
    start: new Date(now.getFullYear(), 0, 1),
    end: new Date(now.getFullYear(), 11, 31),
    label: "This Year",
  };
}

function inRange(dateStr: string, start: Date, end: Date) {
  const d = new Date(dateStr);
  return d >= start && d <= end;
}

function buildChartData(sales: any[], start: Date, end: Date) {
  const days: { date: string; amount: number }[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    const key = cur.toISOString().slice(0, 10);
    const amt = sales
      .filter((s) => s.date === key)
      .reduce((acc, s) => acc + (s.total || 0), 0);
    days.push({ date: key, amount: amt });
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

function Dashboard() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>("this_month");
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const [data, setData] = useState({
    sales: [] as any[],
    purchases: [] as any[],
    parties: [] as any[],
    items: [] as any[],
    expenses: [] as any[],
    banks: [] as any[],
    payments: [] as any[],
  });

  useEffect(() => {
    setData({
      sales: SalesRepo.all(),
      purchases: PurchaseRepo.all(),
      parties: PartyRepo.all(),
      items: ItemRepo.all(),
      expenses: ExpenseRepo.all(),
      banks: BankRepo.all(),
      payments: PaymentRepo.all(),
    });
  }, []);

  const { start, end } = getPeriodRange(period);
  const periodLabel = getPeriodRange(period).label;

  const periodSales = data.sales.filter((s) => inRange(s.date, start, end));
  const periodPurchases = data.purchases.filter((s) => inRange(s.date, start, end));
  const periodExpenses = data.expenses.filter((s) => inRange(s.date, start, end));

  const totalSale = periodSales.reduce((a, s) => a + (s.total || 0), 0);
  const totalPurchase = periodPurchases.reduce((a, s) => a + (s.total || 0), 0);
  const totalExpense = periodExpenses.reduce((a, s) => a + (s.amount || 0), 0);

  const receivable = data.sales.reduce((a, s) => a + Math.max(0, (s.total || 0) - (s.paid || 0)), 0);
  const payable = data.purchases.reduce((a, s) => a + Math.max(0, (s.total || 0) - (s.paid || 0)), 0);

  const receivableParties = new Set(
    data.sales.filter((s) => (s.total || 0) - (s.paid || 0) > 0).map((s) => s.partyId)
  ).size;
  const payableParties = new Set(
    data.purchases.filter((s) => (s.total || 0) - (s.paid || 0) > 0).map((s) => s.partyId)
  ).size;

  const stockValue = data.items.reduce((a, i) => a + (i.stock || 0) * (i.purchasePrice || 0), 0);
  const cashInHand = data.sales.filter((s) => s.paymentMode === "cash").reduce((a, s) => a + (s.paid || 0), 0)
    - data.purchases.filter((s) => s.paymentMode === "cash").reduce((a, s) => a + (s.paid || 0), 0)
    - data.expenses.filter((s) => s.paymentMode === "cash").reduce((a, s) => a + (s.amount || 0), 0)
    + data.payments.filter((p) => p.mode === "cash" && p.type === "in").reduce((a, p) => a + (p.amount || 0), 0)
    - data.payments.filter((p) => p.mode === "cash" && p.type === "out").reduce((a, p) => a + (p.amount || 0), 0);
  const bankBalance = data.banks.reduce((a, b) => a + (b.balance || b.openingBalance || 0), 0);

  const lowStock = data.items.filter((i) => i.minStock && i.stock <= i.minStock);

  const chartData = useMemo(
    () => buildChartData(data.sales, start, end),
    [data.sales, start, end]
  );

  const chartXLabels = useMemo(() => {
    const total = chartData.length;
    const step = Math.max(1, Math.floor(total / 8));
    return chartData.map((d, i) => {
      if (i % step !== 0 && i !== total - 1) return "";
      const dt = new Date(d.date);
      return `${dt.getDate()} ${dt.toLocaleString("en", { month: "short" })}`;
    });
  }, [chartData]);

  const PERIODS: { value: Period; label: string }[] = [
    { value: "this_month", label: "This Month" },
    { value: "last_month", label: "Last Month" },
    { value: "this_year", label: "This Year" },
  ];

  const reports = [
    { label: "Sale Report", icon: FileText, path: "/sales" },
    { label: "All Transactions", icon: LayoutList, path: "/sales" },
    { label: "Daybook Report", icon: BookOpen, path: "/sales" },
    { label: "Party Statement", icon: Users, path: "/parties" },
  ];

  return (
    <div className="flex h-full overflow-hidden bg-[#f5f6fa]">
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        {/* Receivable / Payable */}
        <div className="flex gap-0 border-b border-gray-200 bg-white">
          {/* Total Receivable */}
          <div className="flex-1 p-5 border-r border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Total Receivable</p>
                <p className="text-[28px] font-bold text-gray-800 leading-tight">₹ {fmt(receivable)}</p>
                <p className="text-xs text-gray-400 mt-1">From {receivableParties} {receivableParties === 1 ? "Party" : "Parties"}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mt-1">
                <ArrowDownLeft className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </div>

          {/* Total Payable */}
          <div className="flex-1 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Total Payable</p>
                <p className="text-[28px] font-bold text-gray-800 leading-tight">₹ {fmt(payable)}</p>
                <p className="text-xs text-gray-400 mt-1">From {payableParties} {payableParties === 1 ? "Party" : "Parties"}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-rose-50 border-2 border-rose-200 flex items-center justify-center mt-1">
                <ArrowUpRight className="h-5 w-5 text-rose-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Sales chart */}
        <div className="bg-white border-b border-gray-200 px-5 pt-4 pb-2">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Sale</p>
              <p className="text-[22px] font-bold text-gray-800 leading-tight">
                ₹ {fmt(totalSale)}
                {totalSale === 0 && (
                  <span className="ml-3 text-xs font-normal text-gray-400">No sales yet</span>
                )}
              </p>
            </div>

            {/* Period selector */}
            <div className="relative">
              <button
                onClick={() => setShowPeriodMenu((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 transition"
              >
                {periodLabel}
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              </button>
              {showPeriodMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 min-w-[140px]">
                  {PERIODS.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => { setPeriod(p.value); setShowPeriodMenu(false); }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-50 hover:text-blue-600 transition ${period === p.value ? "text-blue-600 font-semibold bg-blue-50" : "text-gray-700"}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="h-[180px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="saleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                  tickFormatter={(_, i) => chartXLabels[i] ?? ""}
                  interval={0}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                  tickFormatter={(v) => v === 0 ? "0" : `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12, border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 10px" }}
                  labelFormatter={(label) => {
                    const d = new Date(label);
                    return `${d.getDate()} ${d.toLocaleString("en", { month: "short", year: "numeric" })}`;
                  }}
                  formatter={(v: number) => [`₹ ${fmt(v)}`, "Sale"]}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#saleGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#3b82f6" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Used Reports */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">Most Used Reports</span>
            <button
              onClick={() => navigate({ to: "/sales" })}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {reports.map((r) => (
              <button
                key={r.label}
                onClick={() => navigate({ to: r.path as any })}
                className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-blue-300 hover:bg-blue-50/40 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-md bg-blue-50 flex items-center justify-center">
                    <r.icon className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">{r.label}</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-blue-400 transition" />
              </button>
            ))}
          </div>

          {/* Quick Actions row */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => navigate({ to: "/sales/new" })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700 transition"
            >
              <Plus className="h-3.5 w-3.5" /> Add Sale
            </button>
            <button
              onClick={() => navigate({ to: "/purchase/new" })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-md text-xs font-semibold hover:bg-gray-50 transition"
            >
              <Plus className="h-3.5 w-3.5" /> Add Purchase
            </button>
            <button
              onClick={() => navigate({ to: "/parties" })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-md text-xs font-semibold hover:bg-gray-50 transition"
            >
              <Users className="h-3.5 w-3.5" /> Add Party
            </button>
            <button
              onClick={() => navigate({ to: "/items" })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-md text-xs font-semibold hover:bg-gray-50 transition"
            >
              <Package className="h-3.5 w-3.5" /> Add Item
            </button>
          </div>

          {lowStock.length > 0 && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-xs font-semibold text-amber-700">Low Stock Alerts ({lowStock.length})</span>
              </div>
              <div className="space-y-1">
                {lowStock.slice(0, 4).map((i: any) => (
                  <div key={i.id} className="flex justify-between text-xs text-amber-700">
                    <span className="truncate flex-1">{i.name}</span>
                    <span className="font-semibold ml-2">Stock: {i.stock} / Min: {i.minStock}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Stats Panel */}
      <div className="w-[240px] flex-shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-auto">
        <StatRow
          label="Purchases"
          badge={periodLabel}
          value={`₹ ${fmt(totalPurchase)}`}
        />
        <StatRow
          label="Expenses"
          badge={periodLabel}
          value={`₹ ${fmt(totalExpense)}`}
        />
        <StatRow
          label="Stock Value"
          badge="As of Now"
          value={`₹ ${fmt(stockValue)}`}
        />
        <StatRow
          label="Cash In Hand"
          badge="As of Now"
          value={`₹ ${fmt(Math.max(0, cashInHand))}`}
        />
        <StatRow
          label="Total Bank Balance"
          badge="As of Now"
          value={`₹ ${fmt(bankBalance)}`}
        />
        <StatRow
          label="Net Profit"
          badge={periodLabel}
          value={`₹ ${fmt(totalSale - totalPurchase - totalExpense)}`}
          valueClass={totalSale - totalPurchase - totalExpense >= 0 ? "text-emerald-600" : "text-rose-600"}
        />

        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-semibold text-gray-700">Business Summary</span>
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Track your receivables, payables and profit at a glance. Add transactions to see live insights.
          </p>
        </div>

        <div className="border-t border-gray-200 p-4 mt-auto">
          <button
            onClick={() => navigate({ to: "/sales" })}
            className="w-full flex items-center justify-between px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
          >
            <span>Add Widget of Your Choice</span>
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function StatRow({
  label,
  badge,
  value,
  valueClass = "text-gray-800",
}: {
  label: string;
  badge: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="px-4 py-3.5 border-b border-gray-100">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <span className="text-[10px] text-gray-400 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5">
          {badge}
        </span>
      </div>
      <p className={`text-[16px] font-bold mt-0.5 ${valueClass}`}>{value}</p>
    </div>
  );
}
