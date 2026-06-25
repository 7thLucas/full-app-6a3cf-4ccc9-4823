/**
 * Inventory Management — Owner only.
 * View stock levels, update quantities, see low-stock alerts.
 * Seeded from configurables.rawMaterials on first load.
 */
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { Package, AlertTriangle, CheckCircle2, Plus, Minus, RefreshCw } from "lucide-react";
import { cn } from "~/lib/utils";
import { useConfigurables } from "~/modules/configurables";
import { usePOSStore } from "~/lib/pos-store";
import { getPOSDb, type InventoryItem } from "~/lib/pos-db.client";
import { BottomNav } from "~/components/bottom-nav";

export default function InventoryPage() {
  const { config, loading } = useConfigurables();
  const { role } = usePOSStore();
  const navigate = useNavigate();

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (role === "kasir") {
      navigate("/", { replace: true });
    }
  }, [role, navigate]);

  const loadInventory = useCallback(async () => {
    if (typeof window === "undefined" || role !== "owner") return;
    const db = getPOSDb();
    const items = await db.inventory.toArray();
    setInventory(items);
  }, [role]);

  // Seed inventory from configurables on first load
  const seedInventory = useCallback(async () => {
    const raws = config?.rawMaterials ?? [];
    if (typeof window === "undefined" || raws.length === 0) return;
    setSyncing(true);
    const db = getPOSDb();

    for (const rm of raws) {
      const existing = await db.inventory.get(rm.id);
      if (!existing) {
        await db.inventory.put({
          id: rm.id,
          name: rm.name,
          unit: rm.unit,
          stock: rm.stock,
          minStock: rm.minStock ?? 0,
          lastUpdated: Date.now(),
        });
      }
    }
    await loadInventory();
    setSyncing(false);
  }, [config, loadInventory]);

  useEffect(() => {
    if (role === "owner") {
      loadInventory().then((items) => {
        // If no items in DB yet, seed from configurables
        if (inventory.length === 0) {
          seedInventory();
        }
      });
    }
  }, [role, loadInventory, seedInventory]);

  const adjustStock = useCallback(
    async (id: string, delta: number) => {
      if (typeof window === "undefined") return;
      const db = getPOSDb();
      const item = await db.inventory.get(id);
      if (!item) return;
      const newStock = Math.max(0, item.stock + delta);
      await db.inventory.update(id, { stock: newStock, lastUpdated: Date.now() });
      setInventory((prev) =>
        prev.map((i) => (i.id === id ? { ...i, stock: newStock } : i))
      );
    },
    []
  );

  const resetToConfig = useCallback(async () => {
    const raws = config?.rawMaterials ?? [];
    if (typeof window === "undefined" || raws.length === 0) return;
    setSyncing(true);
    const db = getPOSDb();
    for (const rm of raws) {
      await db.inventory.put({
        id: rm.id,
        name: rm.name,
        unit: rm.unit,
        stock: rm.stock,
        minStock: rm.minStock ?? 0,
        lastUpdated: Date.now(),
      });
    }
    await loadInventory();
    setSyncing(false);
  }, [config, loadInventory]);

  if (loading || role === "kasir") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const lowStockItems = inventory.filter((i) => i.stock <= i.minStock);
  const okItems = inventory.filter((i) => i.stock > i.minStock);

  return (
    <div className="flex min-h-screen flex-col bg-background pb-24">
      <header className="sticky top-0 z-30 bg-background px-4 pt-safe-top">
        <div className="flex items-center justify-between py-3">
          <div>
            <h1
              className="text-lg font-bold text-foreground"
              style={{ fontFamily: "var(--heading-font)" }}
            >
              Inventori
            </h1>
            <p className="text-xs text-muted-foreground">
              Kelola stok bahan baku
            </p>
          </div>
          <button
            onClick={resetToConfig}
            disabled={syncing}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted disabled:opacity-50"
            title="Reset stok ke nilai awal dari konfigurasi"
          >
            <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
            Reset
          </button>
        </div>
      </header>

      <main className="flex flex-col gap-4 px-4 pb-4">
        {/* Low stock section */}
        {lowStockItems.length > 0 && (
          <section>
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle size={14} className="text-destructive" />
              <p className="text-xs font-semibold uppercase tracking-wide text-destructive">
                Stok Kritis ({lowStockItems.length})
              </p>
            </div>
            <div className="space-y-2">
              {lowStockItems.map((item) => (
                <InventoryCard
                  key={item.id}
                  item={item}
                  onAdjust={adjustStock}
                  isLow
                />
              ))}
            </div>
          </section>
        )}

        {/* OK stock section */}
        {okItems.length > 0 && (
          <section>
            <div className="mb-2 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-muted-foreground" />
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Stok Aman ({okItems.length})
              </p>
            </div>
            <div className="space-y-2">
              {okItems.map((item) => (
                <InventoryCard
                  key={item.id}
                  item={item}
                  onAdjust={adjustStock}
                  isLow={false}
                />
              ))}
            </div>
          </section>
        )}

        {inventory.length === 0 && !syncing && (
          <div className="py-12 text-center">
            <Package size={40} className="mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Belum ada data inventori.
            </p>
            <button
              onClick={seedInventory}
              className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
            >
              Muat dari Konfigurasi
            </button>
          </div>
        )}

        {syncing && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Memuat inventori...
          </div>
        )}
      </main>

      <BottomNav role={role} />
    </div>
  );
}

// ─── Inventory Card ────────────────────────────────────────────────────────────
function InventoryCard({
  item,
  onAdjust,
  isLow,
}: {
  item: InventoryItem;
  onAdjust: (id: string, delta: number) => void;
  isLow: boolean;
}) {
  const stockPct =
    item.minStock > 0 ? Math.min(100, (item.stock / (item.minStock * 3)) * 100) : 100;

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 shadow-sm",
        isLow
          ? "border-destructive/40 bg-destructive/10"
          : "border-border bg-card"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p
            className={cn(
              "text-sm font-semibold",
              isLow ? "text-destructive" : "text-card-foreground"
            )}
          >
            {item.name}
          </p>
          <p className="text-xs text-muted-foreground">
            Min: {item.minStock} {item.unit}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAdjust(item.id, -1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-foreground hover:bg-accent"
          >
            <Minus size={14} />
          </button>
          <span
            className={cn(
              "min-w-[3rem] text-center text-base font-bold",
              isLow ? "text-destructive" : "text-card-foreground"
            )}
          >
            {item.stock}
            <span className="ml-0.5 text-xs font-normal text-muted-foreground">
              {item.unit}
            </span>
          </span>
          <button
            onClick={() => onAdjust(item.id, 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-foreground hover:bg-accent"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Stock bar */}
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            isLow ? "bg-destructive" : "bg-primary"
          )}
          style={{ width: `${stockPct}%` }}
        />
      </div>
    </div>
  );
}
