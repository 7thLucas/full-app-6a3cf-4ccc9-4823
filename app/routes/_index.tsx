/**
 * CatatAja — Main POS Screen
 * Calculator-first UI for Kasir. Owner unlocks via PIN.
 * Everything is instant, offline-first, no loading screens.
 */
import { useEffect, useState, useCallback } from "react";
import { Delete, ChevronRight, LogOut, TrendingUp } from "lucide-react";
import { cn } from "~/lib/utils";
import { useConfigurables } from "~/modules/configurables";
import { usePOSStore } from "~/lib/pos-store";
import { getPOSDb, todayISODate, formatRupiah, type Transaction } from "~/lib/pos-db.client";
import { PinModal } from "~/components/pin-modal";
import { BottomNav } from "~/components/bottom-nav";
import { ClosingModal } from "~/components/closing-modal";

// ─── Numpad key definition ────────────────────────────────────────────────────
const NUMPAD_KEYS = [
  "7", "8", "9",
  "4", "5", "6",
  "1", "2", "3",
  ".", "0", "⌫",
];

export default function KasirPage() {
  const { config, loading } = useConfigurables();

  const {
    role, setRole,
    displayValue, appendDigit, deleteLastDigit, clearDisplay,
    activeCategory, setActiveCategory,
    transactions, setTransactions, addTransaction,
    showPinModal, setShowPinModal,
    showClosingModal, setShowClosingModal,
    showSuccessFeedback, setShowSuccessFeedback,
  } = usePOSStore();

  const [pressedKey, setPressedKey] = useState<string | null>(null);

  // Load today's transactions on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const db = getPOSDb();
    const today = todayISODate();
    db.transactions
      .where("date")
      .equals(today)
      .sortBy("createdAt")
      .then(setTransactions)
      .catch(console.error);
  }, [setTransactions]);

  // Derived totals for today
  const todayIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const todayExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const todayProfit = todayIncome - todayExpense;

  // ----- Numpad handler -----
  const handleNumpadKey = useCallback(
    (key: string) => {
      setPressedKey(key);
      setTimeout(() => setPressedKey(null), 120);

      if (key === "⌫") {
        deleteLastDigit();
      } else {
        appendDigit(key);
      }
    },
    [appendDigit, deleteLastDigit]
  );

  // ----- Manual entry: record transaction from display -----
  const handleRecordManual = useCallback(async () => {
    const amount = parseFloat(displayValue);
    if (!amount || isNaN(amount) || amount <= 0) return;

    const db = getPOSDb();
    const tx: Transaction = {
      type: activeCategory,
      amount,
      label: activeCategory === "income"
        ? (config?.incomeCategoryLabel ?? "Pemasukan")
        : (config?.expenseCategoryLabel ?? "Pengeluaran"),
      date: todayISODate(),
      createdAt: Date.now(),
    };
    const id = await db.transactions.add(tx);
    addTransaction({ ...tx, id: id as number });
    clearDisplay();
    setShowSuccessFeedback(
      `${activeCategory === "income" ? "+" : "-"}${formatRupiah(amount)}`
    );
    setTimeout(() => setShowSuccessFeedback(null), 1800);
  }, [displayValue, activeCategory, config, addTransaction, clearDisplay, setShowSuccessFeedback]);

  // ----- Menu item tap: quick record -----
  const handleMenuItemTap = useCallback(
    async (item: { id: string; name: string; price: number; hpp?: number }) => {
      const db = getPOSDb();
      const tx: Transaction = {
        type: "income",
        amount: item.price,
        label: item.name,
        menuItemId: item.id,
        quantity: 1,
        date: todayISODate(),
        createdAt: Date.now(),
      };
      const id = await db.transactions.add(tx);
      addTransaction({ ...tx, id: id as number });

      // Auto-deduct inventory if tracking is enabled (silent, background)
      if (config?.menuItems && config.enableInventoryTracking) {
        try {
          const recipes = await db.recipes
            .where("menuItemId")
            .equals(item.id)
            .toArray();
          for (const recipe of recipes) {
            const inv = await db.inventory.get(recipe.ingredientId);
            if (inv) {
              await db.inventory.update(recipe.ingredientId, {
                stock: Math.max(0, inv.stock - recipe.quantity),
                lastUpdated: Date.now(),
              });
            }
          }
        } catch {
          // silent fail — inventory deduction is best-effort
        }
      }

      setShowSuccessFeedback(`+${formatRupiah(item.price)} — ${item.name}`);
      setTimeout(() => setShowSuccessFeedback(null), 1800);
    },
    [config, addTransaction, setShowSuccessFeedback]
  );

  // ----- PIN unlock -----
  const handlePinSuccess = useCallback(() => {
    setRole("owner");
    setShowPinModal(false);
  }, [setRole, setShowPinModal]);

  const handleLogout = useCallback(() => {
    setRole("kasir");
  }, [setRole]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-3 text-4xl">☕</div>
          <p className="text-sm text-muted-foreground">Memuat CatatAja...</p>
        </div>
      </div>
    );
  }

  const menuItems = config?.menuItems ?? [];
  const ownerPin = config?.ownerPin ?? "1234";
  const currency = config?.currency ?? "Rp";
  const businessName = config?.businessName ?? "Warung Saya";
  const appName = config?.appName ?? "CatatAja";
  const closingLabel = config?.closingButtonLabel ?? "Tutup Kasir";
  const incomeLbl = config?.incomeCategoryLabel ?? "Pemasukan";
  const expenseLbl = config?.expenseCategoryLabel ?? "Pengeluaran";
  const showProfit = config?.showProfitToKasir ?? false;

  return (
    <div className="relative flex min-h-screen flex-col bg-background pb-20">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-background px-4 pt-safe-top">
        <div className="flex items-center justify-between py-3">
          <div>
            <h1
              className="text-lg font-bold text-foreground leading-none"
              style={{ fontFamily: "var(--heading-font)" }}
            >
              {appName}
            </h1>
            <p className="text-xs text-muted-foreground">{businessName}</p>
          </div>
          <div className="flex items-center gap-2">
            {role === "owner" && (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                Owner
              </span>
            )}
            {role === "kasir" ? (
              <button
                onClick={() => setShowPinModal(true)}
                className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
              >
                Masuk Owner <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
              >
                <LogOut size={14} /> Keluar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Success Feedback Toast ── */}
      {showSuccessFeedback && (
        <div className="pointer-events-none fixed inset-x-0 top-20 z-50 flex justify-center">
          <div className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-lg transition-all">
            {showSuccessFeedback}
          </div>
        </div>
      )}

      <main className="flex flex-col gap-4 px-4 pb-2">
        {/* ── Daily Summary (Owner sees profit, Kasir only income/expense) ── */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-card px-4 py-3 shadow-sm">
            <p className="text-xs text-card-foreground/70 mb-1">{incomeLbl}</p>
            <p className="text-base font-bold text-card-foreground">
              {currency} {todayIncome.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="rounded-xl bg-card px-4 py-3 shadow-sm">
            <p className="text-xs text-card-foreground/70 mb-1">{expenseLbl}</p>
            <p className="text-base font-bold text-card-foreground">
              {currency} {todayExpense.toLocaleString("id-ID")}
            </p>
          </div>
          {(role === "owner" || showProfit) && (
            <div className="col-span-2 flex items-center gap-2 rounded-xl bg-primary px-4 py-3 shadow-sm">
              <TrendingUp size={16} className="text-primary-foreground/80" />
              <p className="text-xs text-primary-foreground/80 mr-auto">Profit Hari Ini</p>
              <p className="text-base font-bold text-primary-foreground">
                {currency} {todayProfit.toLocaleString("id-ID")}
              </p>
            </div>
          )}
        </div>

        {/* ── Category Chips ── */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveCategory("income")}
            className={cn(
              "flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-150",
              activeCategory === "income"
                ? "bg-primary text-primary-foreground scale-105"
                : "bg-muted text-muted-foreground border border-border"
            )}
          >
            + {incomeLbl}
          </button>
          <button
            onClick={() => setActiveCategory("expense")}
            className={cn(
              "flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-150",
              activeCategory === "expense"
                ? "bg-secondary text-secondary-foreground scale-105"
                : "bg-muted text-muted-foreground border border-border"
            )}
          >
            - {expenseLbl}
          </button>
        </div>

        {/* ── Menu Item Buttons ── */}
        {menuItems.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Menu Cepat
            </p>
            <div className="grid grid-cols-2 gap-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuItemTap(item)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border border-border bg-popover px-3 py-3",
                    "text-left transition-transform active:scale-95 hover:bg-muted",
                    "shadow-sm"
                  )}
                  style={{ transition: "transform 0.05s ease-out, background 0.05s ease-out" }}
                >
                  <span className="text-xl">{(item as any).emoji ?? "🍽️"}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {currency} {item.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Display ── */}
        <div
          className="flex items-end justify-end rounded-2xl border border-border bg-popover px-5 py-4 shadow-sm"
          style={{ minHeight: 72 }}
        >
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-muted-foreground">{currency}</span>
            <span
              className="break-all text-right text-4xl font-bold text-foreground"
              style={{ fontFamily: "var(--heading-font)", lineHeight: 1 }}
            >
              {parseFloat(displayValue || "0").toLocaleString("id-ID", {
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        {/* ── Numpad ── */}
        <div className="grid grid-cols-3 gap-2">
          {NUMPAD_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => handleNumpadKey(key)}
              className={cn(
                "flex h-[72px] items-center justify-center rounded-xl border border-border",
                "text-2xl font-bold text-foreground transition-all duration-75",
                key === "⌫"
                  ? "bg-muted text-muted-foreground"
                  : "bg-popover hover:bg-muted",
                pressedKey === key && "bg-primary text-primary-foreground scale-95"
              )}
            >
              {key === "⌫" ? <Delete size={24} /> : key}
            </button>
          ))}
        </div>

        {/* ── Record Button + Closing ── */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleRecordManual}
            disabled={displayValue === "0" || displayValue === ""}
            className={cn(
              "flex h-14 w-full items-center justify-center rounded-xl",
              "bg-primary text-primary-foreground text-base font-bold",
              "transition-transform active:scale-98 disabled:opacity-40",
              "shadow-sm"
            )}
          >
            Catat {activeCategory === "income" ? incomeLbl : expenseLbl}
          </button>

          <button
            onClick={() => setShowClosingModal(true)}
            className={cn(
              "flex h-14 w-full items-center justify-center rounded-xl gap-2",
              "bg-secondary text-secondary-foreground text-base font-bold",
              "transition-transform active:scale-98",
              "shadow-sm"
            )}
          >
            {closingLabel}
          </button>
        </div>
      </main>

      {/* ── PIN Modal ── */}
      {showPinModal && (
        <PinModal
          onSuccess={handlePinSuccess}
          onClose={() => setShowPinModal(false)}
          correctPin={ownerPin}
        />
      )}

      {/* ── Closing Modal ── */}
      {showClosingModal && (
        <ClosingModal
          transactions={transactions}
          role={role}
          config={config}
          onClose={() => setShowClosingModal(false)}
        />
      )}

      {/* ── Bottom Nav ── */}
      <BottomNav role={role} />
    </div>
  );
}
