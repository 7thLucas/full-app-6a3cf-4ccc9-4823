/**
 * CatatAja — IndexedDB client using Dexie
 * Offline-first persistent storage for all POS data.
 * This file must only be imported on the client side.
 */
import Dexie, { type Table } from "dexie";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TransactionType = "income" | "expense";

export interface Transaction {
  id?: number;
  type: TransactionType;
  amount: number;
  label: string;           // menu item name or expense category
  menuItemId?: string;     // set when type === "income" and comes from a menu item
  quantity?: number;       // how many portions / units
  note?: string;
  date: string;            // ISO date string YYYY-MM-DD
  createdAt: number;       // Date.now() timestamp
}

export interface DailyClosing {
  id?: number;
  date: string;            // YYYY-MM-DD
  grossIncome: number;
  totalExpense: number;
  netProfit: number;       // only visible to Owner
  soldItems: Array<{ menuItemId: string; name: string; qty: number; total: number; hpp: number }>;
  expenses: Array<{ label: string; amount: number }>;
  lowStockItems: Array<{ id: string; name: string; unit: string; stock: number; minStock: number }>;
  closedAt: number;
}

export interface InventoryItem {
  id: string;              // matches rawMaterials.id from configurables
  name: string;
  unit: string;
  stock: number;
  minStock: number;
  lastUpdated: number;
}

export interface RecipeItem {
  id?: number;
  menuItemId: string;
  ingredientId: string;    // matches InventoryItem.id
  quantity: number;        // amount to deduct per 1 portion sold
}

// ---------------------------------------------------------------------------
// Database definition
// ---------------------------------------------------------------------------

class CatatAjaDB extends Dexie {
  transactions!: Table<Transaction>;
  closings!: Table<DailyClosing>;
  inventory!: Table<InventoryItem>;
  recipes!: Table<RecipeItem>;

  constructor() {
    super("CatatAjaDB");
    this.version(1).stores({
      transactions: "++id, date, type, menuItemId, createdAt",
      closings:     "++id, date, closedAt",
      inventory:    "id, name",
      recipes:      "++id, menuItemId, ingredientId",
    });
  }
}

// Singleton — safe to call multiple times on client
let _db: CatatAjaDB | null = null;

export function getPOSDb(): CatatAjaDB {
  if (!_db) {
    _db = new CatatAjaDB();
  }
  return _db;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatRupiah(amount: number): string {
  return "Rp " + amount.toLocaleString("id-ID");
}
