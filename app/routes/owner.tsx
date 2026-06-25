/**
 * Owner Dashboard — Full profit visibility, history, inventory alerts.
 * Only accessible after PIN authentication.
 * Redirects to / if user is not in owner role.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, Calendar } from "lucide-react";
import { cn } from "~/lib/utils";
import { useConfigurables } from "~/modules/configurables";
import { usePOSStore } from "~/lib/pos-store";
import { getPOSDb, formatRupiah, todayISODate, type Transaction } from "~/lib/pos-db.client";
import { BottomNav } from "~/components/bottom-nav";

interface DailySummary {
  date: string;
  grossIncome: number;
  totalExpense: number;
  netProfit: number;
  txCount: number;
}

export default function OwnerPage() {
  const { config, loading } = useConfigurables();
  const { role } = usePOSStore();
  const navigate = useNavigate();

  const [todayTxs, setTodayTxs] = useState<Transaction[]>([]);
  const [weekHistory, setWeekHistory] = useState<DailySummary[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);

  // Redirect kasir back to main screen
  useEffect(() => {
    if (role === "kasir") {
      navigate("/", { replace: true });
    }
  }, [role, navigate]);

  useEffect(() => {
    if (typeof window === "undefined" || role !== "owner") return;
    const db = getPOSDb();
    const today = todayISODate();

    // Load today's transactions
    db.transactions
      .where("date")
      .equals(today)
      .sortBy("createdAt")
      .then(setTodayTxs)
      .catch(console.error);

    // Load last 7 days summary
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().slice(0, 10);
    });

    Promise.all(
      last7.map(async (date) => {
        const txs = await db.transactions.where("date").equals(date).toArray();
        const grossIncome = txs
          .filter((t) => t.type === "income")
          .reduce((s, t) => s + t.amount, 0);
        const totalExpense = txs
          .filter((t) => t.type === "expense")
          .reduce((s, t) => s + t.amount, 0);

        // Compute HPP from sold items
        let totalHPP = 0;
        for (const tx of txs) {
          if (tx.type !== "income" || !tx.menuItemId) continue;
          const menuItem = config?.menuItems?.find((m) => m.id === tx.menuItemId);
          if (menuItem?.hpp) {
            totalHPP += menuItem.hpp * (tx.quantity ?? 1);
          }
        }

        return {
          date,
          grossIncome,
          totalExpense,
          netProfit: grossIncome - totalExpense - totalHPP,
          txCount: txs.length,
        } as DailySummary;
      })
    ).then(setWeekHistory);

    // Low stock count
    const raws = config?.rawMaterials ?? [];
    setLowStockCount(raws.filter((r) => r.minStock != null && r.stock <= r.minStock).length);
  }, [role, config]);

  if (loading || role === "kasir") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const currency = config?.currency ?? "Rp";
  const today = todayISODate();
  const todaySummary = weekHistory.find((w) => w.date === today);

  const todayIncome = todayTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const todayExpense = todayTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  // Compute HPP for today
  let todayHPP = 0;
  for (const tx of todayTxs) {
    if (tx.type !== "income" || !tx.menuItemId) continue;
    const menuItem = config?.menuItems?.find((m) => m.id === tx.menuItemId);
    if (menuItem?.hpp) {
      todayHPP += menuItem.hpp * (tx.quantity ?? 1);
    }
  }
  const todayNetProfit = todayIncome - todayExpense - todayHPP;

  const weekIncome = weekHistory.reduce((s, d) => s + d.grossIncome, 0);
  const weekProfit = weekHistory.reduce((s, d) => s + d.netProfit, 0);

  // Sold item breakdown for today
  const soldMap = new Map<string, { name: string; qty: number; total: number; margin: number }>();
  for (const tx of todayTxs) {
    if (tx.type !== "income") continue;
    const menuItem = tx.menuItemId ? config?.menuItems?.find((m) => m.id === tx.menuItemId) : null;
    const hpp = menuItem?.hpp ?? 0;
    const key = tx.label;
    const existing = soldMap.get(key);
    if (existing) {
      existing.qty += tx.quantity ?? 1;
      existing.total += tx.amount;
      existing.margin += (tx.amount - hpp * (tx.quantity ?? 1));
    } else {
      soldMap.set(key, {
        name: tx.label,
        qty: tx.quantity ?? 1,
        total: tx.amount,
        margin: tx.amount - hpp * (tx.quantity ?? 1),
      });
    }
  }
  const soldItems = Array.from(soldMap.values());

  const formatDate = (iso: string) => {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background px-4 pt-safe-top">
        <div className="flex items-center justify-between py-3">
          <div>
            <h1
              className="text-lg font-bold text-foreground"
              style={{ fontFamily: "var(--heading-font)" }}
            >
              Dashboard Owner
            </h1>
            <p className="text-xs text-muted-foreground">
              {config?.businessName ?? "Warung Saya"}
            </p>
          </div>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
            Owner
          </span>
        </div>
      </header>

      <main className="flex flex-col gap-5 px-4 pb-4">
        {/* Today's KPI Cards */}
        <section>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Hari Ini — {formatDate(today)}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-card px-4 py-4 shadow-sm">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp size={14} className="text-card-foreground/60" />
                <p className="text-xs text-card-foreground/70">Pemasukan</p>
              </div>
              <p className="text-lg font-bold text-card-foreground">
                {currency} {todayIncome.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="rounded-xl bg-card px-4 py-4 shadow-sm">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingDown size={14} className="text-card-foreground/60" />
                <p className="text-xs text-card-foreground/70">Pengeluaran</p>
              </div>
              <p className="text-lg font-bold text-card-foreground">
                {currency} {todayExpense.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="rounded-xl bg-card px-4 py-4 shadow-sm">
              <div className="flex items-center gap-1.5 mb-1">
                <DollarSign size={14} className="text-card-foreground/60" />
                <p className="text-xs text-card-foreground/70">Total HPP</p>
              </div>
              <p className="text-lg font-bold text-card-foreground">
                {currency} {todayHPP.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="rounded-xl bg-primary px-4 py-4 shadow-sm">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp size={14} className="text-primary-foreground/80" />
                <p className="text-xs text-primary-foreground/80">Net Profit</p>
              </div>
              <p className="text-lg font-bold text-primary-foreground">
                {currency} {todayNetProfit.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </section>

        {/* Low stock alert */}
        {lowStockCount > 0 && (
          <div
            className="flex items-center gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 cursor-pointer hover:bg-destructive/15"
            onClick={() => navigate("/inventory")}
          >
            <AlertTriangle size={18} className="text-destructive flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-destructive">
                {lowStockCount} bahan hampir habis!
              </p>
              <p className="text-xs text-muted-foreground">Tap untuk cek inventori</p>
            </div>
          </div>
        )}

        {/* Sold items today */}
        {soldItems.length > 0 && (
          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Penjualan Hari Ini
            </p>
            <div className="rounded-xl bg-card overflow-hidden shadow-sm">
              {soldItems.map((item, idx) => {
                const marginPct =
                  item.total > 0
                    ? Math.round((item.margin / item.total) * 100)
                    : 0;
                return (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-center justify-between px-4 py-3",
                      idx < soldItems.length - 1 && "border-b border-border/40"
                    )}
                  >
                    <div>
                      <p className="text-sm font-semibold text-card-foreground">{item.name}</p>
                      <p className="text-xs text-card-foreground/60">
                        {item.qty}× — Margin {marginPct}%
                      </p>
                    </div>
                    <p className="text-sm font-bold text-card-foreground">
                      {currency} {item.total.toLocaleString("id-ID")}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 7-day history */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={14} className="text-muted-foreground" />
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              7 Hari Terakhir
            </p>
          </div>
          <div className="mb-2 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-card px-4 py-3 shadow-sm">
              <p className="text-xs text-card-foreground/70">Total Omset</p>
              <p className="text-base font-bold text-card-foreground">
                {currency} {weekIncome.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="rounded-xl bg-card px-4 py-3 shadow-sm">
              <p className="text-xs text-card-foreground/70">Total Profit</p>
              <p className={cn(
                "text-base font-bold",
                weekProfit >= 0 ? "text-card-foreground" : "text-destructive"
              )}>
                {currency} {weekProfit.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {weekHistory.map((day) => (
              <div
                key={day.date}
                className="flex items-center justify-between rounded-xl bg-card px-4 py-3 shadow-sm"
              >
                <div>
                  <p className="text-sm font-semibold text-card-foreground">
                    {formatDate(day.date)}
                    {day.date === today && (
                      <span className="ml-2 text-xs text-primary font-bold">Hari ini</span>
                    )}
                  </p>
                  <p className="text-xs text-card-foreground/60">
                    {day.txCount} transaksi
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-card-foreground">
                    {currency} {day.grossIncome.toLocaleString("id-ID")}
                  </p>
                  <p className={cn(
                    "text-xs font-medium",
                    day.netProfit >= 0 ? "text-card-foreground/70" : "text-destructive"
                  )}>
                    Profit: {currency} {day.netProfit.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <BottomNav role={role} />
    </div>
  );
}
