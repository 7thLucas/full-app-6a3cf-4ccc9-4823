/**
 * CatatAja — Client-side PDF Report Generator
 * Generates daily closing report using jsPDF + autoTable.
 */
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { DailyClosing } from "./pos-db.client";
import { formatRupiah } from "./pos-db.client";

export function generateClosingPDF(
  closing: DailyClosing,
  businessName: string,
  appName: string,
): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;

  // ── Header ──────────────────────────────────────────────────────────────
  doc.setFillColor(158, 103, 82); // primary #9E6752
  doc.rect(0, 0, pageW, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(appName, margin, 13);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(businessName, margin, 20);
  doc.text("Laporan Penutupan Harian", margin, 26);

  // Date
  const dateLabel = new Date(closing.date).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.setFontSize(9);
  doc.text(dateLabel, pageW - margin, 26, { align: "right" });

  // ── Summary Cards ────────────────────────────────────────────────────────
  doc.setTextColor(32, 33, 43); // foreground
  let y = 38;

  const summaryItems = [
    { label: "Total Pemasukan Bruto", value: formatRupiah(closing.grossIncome),  color: [45, 67, 84] as [number, number, number] },
    { label: "Total Pengeluaran",     value: formatRupiah(closing.totalExpense), color: [158, 103, 82] as [number, number, number] },
    { label: "Keuntungan Bersih",     value: formatRupiah(closing.netProfit),    color: [115, 118, 106] as [number, number, number] },
  ];

  const cardW = (pageW - 2 * margin - 8) / 3;
  summaryItems.forEach((item, i) => {
    const x = margin + i * (cardW + 4);
    doc.setFillColor(...item.color);
    doc.roundedRect(x, y, cardW, 18, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(item.label, x + cardW / 2, y + 6, { align: "center" });
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(item.value, x + cardW / 2, y + 14, { align: "center" });
  });

  y += 26;

  // ── Sold Items Table ──────────────────────────────────────────────────────
  doc.setTextColor(32, 33, 43);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Menu Terjual", margin, y);
  y += 3;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Menu", "Qty", "Total", "HPP Total", "Margin"]],
    body: closing.soldItems.map((item) => {
      const margin_ = item.total - item.hpp * item.qty;
      const marginPct = item.total > 0 ? Math.round((margin_ / item.total) * 100) : 0;
      return [
        item.name,
        item.qty.toString(),
        formatRupiah(item.total),
        formatRupiah(item.hpp * item.qty),
        `${marginPct}%`,
      ];
    }),
    headStyles: { fillColor: [115, 118, 106], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [254, 240, 220] },
    styles: { fontSize: 9, cellPadding: 2 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // ── Expenses Table ────────────────────────────────────────────────────────
  if (closing.expenses.length > 0) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Pengeluaran Harian", margin, y);
    y += 3;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Keterangan", "Jumlah"]],
      body: closing.expenses.map((e) => [e.label, formatRupiah(e.amount)]),
      headStyles: { fillColor: [158, 103, 82], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [254, 240, 220] },
      styles: { fontSize: 9, cellPadding: 2 },
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ── Smart Shopping List ───────────────────────────────────────────────────
  if (closing.lowStockItems.length > 0) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Rekomendasi Belanja Besok", margin, y);
    y += 3;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Bahan Baku", "Satuan", "Stok Sisa", "Min Stok", "Status"]],
      body: closing.lowStockItems.map((item) => [
        item.name,
        item.unit,
        item.stock.toString(),
        item.minStock.toString(),
        item.stock === 0 ? "HABIS" : "KRITIS",
      ]),
      headStyles: { fillColor: [45, 67, 84], textColor: 255, fontStyle: "bold" },
      bodyStyles: { textColor: [32, 33, 43] },
      alternateRowStyles: { fillColor: [254, 240, 220] },
      columnStyles: { 4: { fontStyle: "bold", textColor: [192, 57, 43] } },
      styles: { fontSize: 9, cellPadding: 2 },
    });
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(83, 65, 69);
    doc.text(
      `${appName} — Dicetak ${new Date().toLocaleString("id-ID")} | Halaman ${i} dari ${totalPages}`,
      pageW / 2,
      pageH - 8,
      { align: "center" },
    );
  }

  const filename = `laporan-${closing.date}.pdf`;
  doc.save(filename);
}
