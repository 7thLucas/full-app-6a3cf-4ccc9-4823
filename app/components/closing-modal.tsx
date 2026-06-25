/**
 * Closing Modal — 1-click end of day.
 * Generates a summary, optionally creates a PDF, shares to WhatsApp.
 * Kasir sees basic totals. Owner sees full profit breakdown.
 */
import { useState, useMemo } from "react";
import { X, FileText, Share2, CheckCircle2 } from "lucide-react";
import { cn } from "~/lib/utils";
import { formatRupiah, getPOSDb, todayISODate, type Transaction } from "~/lib/pos-db.client";
import type { TDefaultConfigurableData } from "~/modules/configurables";
import type { AppRole } from "~/lib/pos-store";

interface SoldItem {
  menuItemId: string;
  name: string;
  qty: number;
  total: number;
  hpp: number;
}

interface ClosingModalProps {
  transactions: Transaction[];
  role: AppRole;
  config: TDefaultConfigurableData | null | undefined;
  onClose: () => void;
}

export function ClosingModal({ transactions, role, config, onClose }: ClosingModalProps) {
  const [done, setDone] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const currency = config?.currency ?? "Rp";
  const businessName = config?.businessName ?? "Warung Saya";
  const appName = config?.appName ?? "CatatAja";
  const whatsappNumber = config?.whatsappNumber ?? "";
  const showPdfBtn = config?.enablePdfReport !== false;

  const today = todayISODate();

  // Summarize transactions
  const summary = useMemo(() => {
    const incomeTxs = transactions.filter((t) => t.type === "income");
    const expenseTxs = transactions.filter((t) => t.type === "expense");

    const grossIncome = incomeTxs.reduce((s, t) => s + t.amount, 0);
    const totalExpense = expenseTxs.reduce((s, t) => s + t.amount, 0);

    // Group sold menu items
    const soldMap = new Map<string, SoldItem>();
    for (const tx of incomeTxs) {
      if (!tx.menuItemId) continue;
      const existing = soldMap.get(tx.menuItemId);
      const menuItem = config?.menuItems?.find((m) => m.id === tx.menuItemId);
      const hpp = menuItem?.hpp ?? 0;
      if (existing) {
        existing.qty += tx.quantity ?? 1;
        existing.total += tx.amount;
        existing.hpp += hpp * (tx.quantity ?? 1);
      } else {
        soldMap.set(tx.menuItemId, {
          menuItemId: tx.menuItemId,
          name: tx.label,
          qty: tx.quantity ?? 1,
          total: tx.amount,
          hpp: hpp * (tx.quantity ?? 1),
        });
      }
    }

    const soldItems = Array.from(soldMap.values());
    const totalHPP = soldItems.reduce((s, i) => s + i.hpp, 0);
    const netProfit = grossIncome - totalExpense - totalHPP;

    // Expenses grouped
    const expenseMap = new Map<string, number>();
    for (const tx of expenseTxs) {
      expenseMap.set(tx.label, (expenseMap.get(tx.label) ?? 0) + tx.amount);
    }
    const expenseList = Array.from(expenseMap.entries()).map(([label, amount]) => ({
      label,
      amount,
    }));

    return { grossIncome, totalExpense, netProfit, soldItems, expenseList, totalHPP };
  }, [transactions, config]);

  // Low stock items — use ingredients or rawMaterials
  const lowStockItems = useMemo(() => {
    const raws = config?.rawMaterials ?? [];
    return raws.filter(
      (r) => r.minStock != null && r.stock <= r.minStock
    );
  }, [config]);

  const handleGeneratePDF = async () => {
    if (typeof window === "undefined") return;
    setIsGenerating(true);
    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      let y = 15;

      // Header
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(appName, pageW / 2, y, { align: "center" });
      y += 7;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Laporan Harian — ${businessName}`, pageW / 2, y, { align: "center" });
      y += 5;
      doc.text(`Tanggal: ${today}`, pageW / 2, y, { align: "center" });
      y += 10;

      // Summary box
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Ringkasan Hari Ini", 14, y);
      y += 5;

      const summaryRows = [
        ["Total Pemasukan", formatRupiah(summary.grossIncome)],
        ["Total Pengeluaran", formatRupiah(summary.totalExpense)],
      ];
      if (role === "owner") {
        summaryRows.push(["Total HPP", formatRupiah(summary.totalHPP)]);
        summaryRows.push(["Net Profit", formatRupiah(summary.netProfit)]);
      }

      autoTable(doc, {
        startY: y,
        head: [["Keterangan", "Jumlah"]],
        body: summaryRows,
        theme: "grid",
        headStyles: { fillColor: [158, 103, 82] },
        margin: { left: 14, right: 14 },
      });
      y = (doc as any).lastAutoTable.finalY + 10;

      // Sold items
      if (summary.soldItems.length > 0) {
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Daftar Item Terjual", 14, y);
        y += 3;

        const soldRows = summary.soldItems.map((item) => [
          item.name,
          String(item.qty),
          formatRupiah(item.total),
          role === "owner" ? formatRupiah(item.hpp) : "-",
        ]);
        const soldHead = role === "owner"
          ? [["Menu", "Qty", "Total", "HPP"]]
          : [["Menu", "Qty", "Total"]];
        const soldBody = role === "owner"
          ? soldRows
          : soldRows.map((r) => r.slice(0, 3));

        autoTable(doc, {
          startY: y,
          head: soldHead,
          body: soldBody,
          theme: "striped",
          headStyles: { fillColor: [45, 67, 84] },
          margin: { left: 14, right: 14 },
        });
        y = (doc as any).lastAutoTable.finalY + 10;
      }

      // Expenses
      if (summary.expenseList.length > 0) {
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Daftar Pengeluaran", 14, y);
        y += 3;

        autoTable(doc, {
          startY: y,
          head: [["Keterangan", "Jumlah"]],
          body: summary.expenseList.map((e) => [e.label, formatRupiah(e.amount)]),
          theme: "striped",
          headStyles: { fillColor: [83, 65, 69] },
          margin: { left: 14, right: 14 },
        });
        y = (doc as any).lastAutoTable.finalY + 10;
      }

      // Low stock / shopping list
      if (lowStockItems.length > 0) {
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Rekomendasi Belanja Besok", 14, y);
        y += 3;

        autoTable(doc, {
          startY: y,
          head: [["Bahan", "Satuan", "Stok Sisa", "Minimum"]],
          body: lowStockItems.map((item) => [
            item.name,
            item.unit,
            String(item.stock),
            String(item.minStock ?? 0),
          ]),
          theme: "grid",
          headStyles: { fillColor: [192, 57, 43] },
          margin: { left: 14, right: 14 },
        });
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(
          `${appName} — Dibuat otomatis ${new Date().toLocaleString("id-ID")}`,
          pageW / 2,
          doc.internal.pageSize.getHeight() - 8,
          { align: "center" }
        );
      }

      // Save and share
      const filename = `laporan-${businessName.replace(/\s+/g, "-")}-${today}.pdf`;
      const pdfBlob = doc.output("blob");

      // Try native share first (mobile), fallback to download
      if (navigator.share && navigator.canShare?.({ files: [new File([pdfBlob], filename, { type: "application/pdf" })] })) {
        await navigator.share({
          title: `Laporan Harian ${appName}`,
          text: `Laporan harian ${businessName} - ${today}`,
          files: [new File([pdfBlob], filename, { type: "application/pdf" })],
        });
      } else {
        doc.save(filename);
      }

      // Save closing to DB
      const db = getPOSDb();
      await db.closings.add({
        date: today,
        grossIncome: summary.grossIncome,
        totalExpense: summary.totalExpense,
        netProfit: summary.netProfit,
        soldItems: summary.soldItems,
        expenses: summary.expenseList,
        lowStockItems: lowStockItems.map((r) => ({
          id: r.id,
          name: r.name,
          unit: r.unit,
          stock: r.stock,
          minStock: r.minStock ?? 0,
        })),
        closedAt: Date.now(),
      });

      setDone(true);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWhatsApp = () => {
    const text = [
      `*Laporan Harian ${appName}*`,
      `Tanggal: ${today}`,
      `Bisnis: ${businessName}`,
      ``,
      `Total Pemasukan: ${formatRupiah(summary.grossIncome)}`,
      `Total Pengeluaran: ${formatRupiah(summary.totalExpense)}`,
      role === "owner" ? `Net Profit: ${formatRupiah(summary.netProfit)}` : "",
      ``,
      lowStockItems.length > 0
        ? `Perlu Belanja Besok:\n${lowStockItems.map((i) => `- ${i.name} (sisa ${i.stock} ${i.unit})`).join("\n")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    const encoded = encodeURIComponent(text);
    const url = whatsappNumber
      ? `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm sm:items-center">
      <div
        className="relative mx-0 w-full max-w-[430px] overflow-y-auto rounded-t-3xl bg-background p-5 shadow-2xl sm:mx-4 sm:rounded-2xl"
        style={{ maxHeight: "90vh", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}
      >
        {/* Drag handle */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border sm:hidden" />

        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted"
        >
          <X size={18} />
        </button>

        {done ? (
          <div className="py-8 text-center">
            <CheckCircle2 size={48} className="mx-auto mb-3 text-primary" />
            <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--heading-font)" }}>
              Kasir Ditutup!
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Laporan berhasil dibuat. Sampai besok!
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground"
            >
              Tutup
            </button>
          </div>
        ) : (
          <>
            <h2
              className="mb-4 text-xl font-bold text-foreground"
              style={{ fontFamily: "var(--heading-font)" }}
            >
              Tutup Kasir Hari Ini
            </h2>

            {/* Summary Cards */}
            <div className="mb-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-card px-3 py-3">
                <p className="text-xs text-card-foreground/70">Total Pemasukan</p>
                <p className="mt-0.5 text-base font-bold text-card-foreground">
                  {currency} {summary.grossIncome.toLocaleString("id-ID")}
                </p>
              </div>
              <div className="rounded-xl bg-card px-3 py-3">
                <p className="text-xs text-card-foreground/70">Total Pengeluaran</p>
                <p className="mt-0.5 text-base font-bold text-card-foreground">
                  {currency} {summary.totalExpense.toLocaleString("id-ID")}
                </p>
              </div>
              {role === "owner" && (
                <div className="col-span-2 rounded-xl bg-primary px-3 py-3">
                  <p className="text-xs text-primary-foreground/80">Net Profit (setelah HPP)</p>
                  <p className="mt-0.5 text-lg font-bold text-primary-foreground">
                    {currency} {summary.netProfit.toLocaleString("id-ID")}
                  </p>
                </div>
              )}
            </div>

            {/* Sold items */}
            {summary.soldItems.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Item Terjual
                </p>
                <div className="space-y-1.5">
                  {summary.soldItems.map((item) => (
                    <div
                      key={item.menuItemId}
                      className="flex items-center justify-between rounded-lg bg-muted px-3 py-2"
                    >
                      <div>
                        <span className="text-sm font-medium text-foreground">{item.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">×{item.qty}</span>
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {currency} {item.total.toLocaleString("id-ID")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Low stock alert */}
            {lowStockItems.length > 0 && (
              <div className="mb-4 rounded-xl bg-destructive/10 border border-destructive/30 px-3 py-3">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-destructive">
                  Rekomendasi Belanja Besok
                </p>
                <div className="space-y-1">
                  {lowStockItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{item.name}</span>
                      <span className="text-xs text-muted-foreground">
                        Sisa {item.stock} {item.unit} (min. {item.minStock})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2">
              {showPdfBtn && (
                <button
                  onClick={handleGeneratePDF}
                  disabled={isGenerating}
                  className={cn(
                    "flex h-14 w-full items-center justify-center gap-2 rounded-xl",
                    "bg-primary text-primary-foreground text-sm font-bold",
                    "transition-transform active:scale-98 disabled:opacity-60"
                  )}
                >
                  {isGenerating ? (
                    "Membuat PDF..."
                  ) : (
                    <>
                      <FileText size={18} /> Buat & Simpan Laporan PDF
                    </>
                  )}
                </button>
              )}
              <button
                onClick={handleWhatsApp}
                className={cn(
                  "flex h-14 w-full items-center justify-center gap-2 rounded-xl",
                  "bg-secondary text-secondary-foreground text-sm font-bold",
                  "transition-transform active:scale-98"
                )}
              >
                <Share2 size={18} /> Bagikan ke WhatsApp
              </button>
              <button
                onClick={async () => {
                  // Close without PDF
                  const db = getPOSDb();
                  await db.closings.add({
                    date: today,
                    grossIncome: summary.grossIncome,
                    totalExpense: summary.totalExpense,
                    netProfit: summary.netProfit,
                    soldItems: summary.soldItems,
                    expenses: summary.expenseList,
                    lowStockItems: lowStockItems.map((r) => ({
                      id: r.id,
                      name: r.name,
                      unit: r.unit,
                      stock: r.stock,
                      minStock: r.minStock ?? 0,
                    })),
                    closedAt: Date.now(),
                  }).catch(() => {});
                  setDone(true);
                }}
                className="flex h-12 w-full items-center justify-center rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted"
              >
                Tutup Tanpa PDF
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
