import { useState } from "react";
import { cn } from "~/lib/utils";
import { formatRupiah, getPOSDb, todayISODate } from "~/lib/pos-db.client";
import type { DailyClosing } from "~/lib/pos-db.client";
import { generateClosingPDF } from "~/lib/pdf-report.client";
import { X, FileText, Loader2 } from "lucide-react";

interface ClosingModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
  appName: string;
  currency: string;
  menuItemsMap: Record<string, { name: string; hpp: number }>;
  inventoryItems: Array<{ id: string; name: string; unit: string; stock: number; minStock: number }>;
  role: "kasir" | "owner";
}

export function ClosingModal({
  isOpen,
  onClose,
  businessName,
  appName,
  currency,
  menuItemsMap,
  inventoryItems,
  role,
}: ClosingModalProps) {
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState<DailyClosing | null>(null);
  const [generated, setGenerated] = useState(false);

  const buildClosing = async (): Promise<DailyClosing> => {
    const db = getPOSDb();
    const today = todayISODate();
    const txs = await db.transactions.where("date").equals(today).toArray();

    const incomes = txs.filter((t) => t.type === "income");
    const expenses = txs.filter((t) => t.type === "expense");

    const grossIncome = incomes.reduce((s, t) => s + t.amount, 0);
    const totalExpense = expenses.reduce((s, t) => s + t.amount, 0);

    // Aggregate sold items
    const soldMap: Record<string, { name: string; qty: number; total: number; hpp: number }> = {};
    for (const tx of incomes) {
      const key = tx.menuItemId || tx.label;
      if (!soldMap[key]) {
        soldMap[key] = {
          name: tx.label,
          qty: 0,
          total: 0,
          hpp: menuItemsMap[tx.menuItemId || ""]?.hpp ?? 0,
        };
      }
      soldMap[key].qty += tx.quantity ?? 1;
      soldMap[key].total += tx.amount;
    }

    // Aggregate expenses
    const expMap: Record<string, number> = {};
    for (const tx of expenses) {
      expMap[tx.label] = (expMap[tx.label] ?? 0) + tx.amount;
    }

    // HPP total
    const totalHPP = Object.values(soldMap).reduce(
      (s, item) => s + item.hpp * item.qty,
      0,
    );
    const netProfit = grossIncome - totalExpense - totalHPP;

    // Low-stock items from IndexedDB inventory
    const inv = await db.inventory.toArray();
    const lowStock = inv.filter((i) => i.stock <= i.minStock);

    return {
      date: today,
      grossIncome,
      totalExpense,
      netProfit,
      soldItems: Object.entries(soldMap).map(([id, v]) => ({
        menuItemId: id,
        name: v.name,
        qty: v.qty,
        total: v.total,
        hpp: v.hpp,
      })),
      expenses: Object.entries(expMap).map(([label, amount]) => ({ label, amount })),
      lowStockItems: lowStock,
      closedAt: Date.now(),
    };
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const c = await buildClosing();
      setClosing(c);
      // Save to DB
      await getPOSDb().closings.add(c);
      setGenerated(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!closing) return;
    generateClosingPDF(closing, businessName, appName);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={cn(
          "bg-background w-full max-w-[430px] rounded-t-3xl p-5 pb-8 shadow-2xl",
          "animate-in slide-in-from-bottom-4 duration-300",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Tutup Kasir</h2>
          <button onClick={onClose} className="p-1">
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        {!generated ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Generate laporan harian dan daftar belanja besok secara otomatis.
            </p>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full min-h-[56px] rounded-xl bg-primary text-primary-foreground font-semibold text-base flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-60"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Memproses...</>
              ) : (
                <><FileText size={18} /> Buat Laporan Penutupan</>
              )}
            </button>
          </div>
        ) : closing ? (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-accent text-accent-foreground rounded-xl p-3 text-center">
                <p className="text-[10px] font-medium opacity-80 mb-1">Pemasukan</p>
                <p className="text-sm font-bold">{formatRupiah(closing.grossIncome)}</p>
              </div>
              <div className="bg-primary text-primary-foreground rounded-xl p-3 text-center">
                <p className="text-[10px] font-medium opacity-80 mb-1">Pengeluaran</p>
                <p className="text-sm font-bold">{formatRupiah(closing.totalExpense)}</p>
              </div>
              <div className="bg-secondary text-secondary-foreground rounded-xl p-3 text-center">
                <p className="text-[10px] font-medium opacity-80 mb-1">Profit Bersih</p>
                <p className="text-sm font-bold">
                  {role === "owner" ? formatRupiah(closing.netProfit) : "***"}
                </p>
              </div>
            </div>

            {closing.lowStockItems.length > 0 && (
              <div className="bg-muted rounded-xl p-3">
                <p className="text-xs font-bold text-foreground mb-2">
                  Belanja Besok ({closing.lowStockItems.length} item)
                </p>
                {closing.lowStockItems.slice(0, 3).map((i) => (
                  <p key={i.id} className="text-xs text-muted-foreground">
                    {i.stock === 0 ? "HABIS" : "KRITIS"} — {i.name} ({i.stock} {i.unit} tersisa)
                  </p>
                ))}
                {closing.lowStockItems.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{closing.lowStockItems.length - 3} lainnya
                  </p>
                )}
              </div>
            )}

            <button
              onClick={handleDownloadPDF}
              className="w-full min-h-[56px] rounded-xl bg-primary text-primary-foreground font-semibold text-base flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <FileText size={18} /> Download PDF Laporan
            </button>

            <button
              onClick={onClose}
              className="w-full text-center text-sm text-muted-foreground py-2"
            >
              Selesai
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
