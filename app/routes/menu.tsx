/**
 * Menu Management — Owner only.
 * View menu items with HPP and margin analysis.
 * Add/edit menu items (stored in configurables for persistence).
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { UtensilsCrossed, TrendingUp, Info } from "lucide-react";
import { cn } from "~/lib/utils";
import { useConfigurables } from "~/modules/configurables";
import { usePOSStore } from "~/lib/pos-store";
import { BottomNav } from "~/components/bottom-nav";
import type { TMenuItem } from "~/modules/configurables";

export default function MenuPage() {
  const { config, loading } = useConfigurables();
  const { role } = usePOSStore();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");

  useEffect(() => {
    if (role === "kasir") {
      navigate("/", { replace: true });
    }
  }, [role, navigate]);

  if (loading || role === "kasir") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const menuItems = config?.menuItems ?? [];
  const currency = config?.currency ?? "Rp";

  // Get unique categories
  const categories = ["Semua", ...Array.from(new Set(menuItems.map((m) => (m as any).category ?? "Lainnya")))];

  const filteredItems =
    selectedCategory === "Semua"
      ? menuItems
      : menuItems.filter((m) => ((m as any).category ?? "Lainnya") === selectedCategory);

  // Overall stats
  const avgMargin =
    menuItems.length > 0
      ? Math.round(
          menuItems.reduce((sum, m) => {
            if (!m.hpp || m.price === 0) return sum;
            return sum + ((m.price - m.hpp) / m.price) * 100;
          }, 0) / menuItems.filter((m) => m.hpp && m.price).length
        )
      : 0;

  const bestMarginItem = menuItems.reduce(
    (best, m) => {
      if (!m.hpp || m.price === 0) return best;
      const margin = ((m.price - m.hpp) / m.price) * 100;
      return margin > (best?.margin ?? 0) ? { ...m, margin } : best;
    },
    null as (TMenuItem & { margin: number }) | null
  );

  return (
    <div className="flex min-h-screen flex-col bg-background pb-24">
      <header className="sticky top-0 z-30 bg-background px-4 pt-safe-top">
        <div className="flex items-center justify-between py-3">
          <div>
            <h1
              className="text-lg font-bold text-foreground"
              style={{ fontFamily: "var(--heading-font)" }}
            >
              Manajemen Menu
            </h1>
            <p className="text-xs text-muted-foreground">
              HPP & margin analysis
            </p>
          </div>
          <UtensilsCrossed size={20} className="text-muted-foreground" />
        </div>
      </header>

      <main className="flex flex-col gap-4 px-4 pb-4">
        {/* Overview stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-card px-4 py-3 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp size={13} className="text-card-foreground/60" />
              <p className="text-xs text-card-foreground/70">Avg. Margin</p>
            </div>
            <p className="text-xl font-bold text-card-foreground">{avgMargin}%</p>
          </div>
          {bestMarginItem && (
            <div className="rounded-xl bg-primary px-4 py-3 shadow-sm">
              <p className="text-xs text-primary-foreground/80 mb-1">Menu Terbaik</p>
              <p className="text-sm font-bold text-primary-foreground truncate">
                {(bestMarginItem as any).emoji ?? ""} {bestMarginItem.name}
              </p>
              <p className="text-xs text-primary-foreground/70">
                Margin {Math.round(bestMarginItem.margin)}%
              </p>
            </div>
          )}
        </div>

        {/* Category filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-all",
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground scale-105"
                  : "bg-muted text-muted-foreground border border-border"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu items list */}
        <div className="space-y-2">
          {filteredItems.map((item) => {
            const margin =
              item.hpp && item.price > 0
                ? Math.round(((item.price - item.hpp) / item.price) * 100)
                : null;
            const profit = item.hpp ? item.price - item.hpp : null;

            return (
              <div
                key={item.id}
                className="rounded-xl border border-border bg-card px-4 py-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl flex-shrink-0">
                      {(item as any).emoji ?? "🍽️"}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-card-foreground truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-card-foreground/60">
                        {(item as any).category ?? "Lainnya"}
                      </p>
                    </div>
                  </div>

                  {margin !== null && (
                    <span
                      className={cn(
                        "ml-2 flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold",
                        margin >= 50
                          ? "bg-primary/20 text-primary"
                          : margin >= 30
                          ? "bg-accent/30 text-accent-foreground"
                          : "bg-destructive/20 text-destructive"
                      )}
                    >
                      {margin}%
                    </span>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-muted px-2 py-2">
                    <p className="text-xs text-muted-foreground">Harga Jual</p>
                    <p className="mt-0.5 text-sm font-bold text-foreground">
                      {currency} {item.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted px-2 py-2">
                    <p className="text-xs text-muted-foreground">HPP</p>
                    <p className="mt-0.5 text-sm font-bold text-foreground">
                      {item.hpp
                        ? `${currency} ${item.hpp.toLocaleString("id-ID")}`
                        : "—"}
                    </p>
                  </div>
                  <div className={cn(
                    "rounded-lg px-2 py-2",
                    profit && profit > 0 ? "bg-primary/15" : "bg-muted"
                  )}>
                    <p className="text-xs text-muted-foreground">Profit/pcs</p>
                    <p
                      className={cn(
                        "mt-0.5 text-sm font-bold",
                        profit && profit > 0 ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {profit != null
                        ? `${currency} ${profit.toLocaleString("id-ID")}`
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* Margin bar */}
                {margin !== null && (
                  <div className="mt-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Margin</span>
                      <span className="text-xs font-semibold text-muted-foreground">{margin}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          margin >= 50 ? "bg-primary" : margin >= 30 ? "bg-accent" : "bg-destructive"
                        )}
                        style={{ width: `${Math.min(100, margin)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {menuItems.length === 0 && (
          <div className="py-12 text-center">
            <UtensilsCrossed size={40} className="mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Belum ada menu.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Tambah menu items di pengaturan konfigurasi.
            </p>
          </div>
        )}

        {/* Info note */}
        <div className="flex items-start gap-2 rounded-xl bg-muted px-4 py-3">
          <Info size={14} className="mt-0.5 text-muted-foreground flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Untuk edit menu, ubah di panel konfigurasi owner. HPP dan harga jual
            digunakan untuk menghitung profit otomatis saat kasir mencatat penjualan.
          </p>
        </div>
      </main>

      <BottomNav role={role} />
    </div>
  );
}
