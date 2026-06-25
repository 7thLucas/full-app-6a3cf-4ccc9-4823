/**
 * CatatAja — Zustand POS store
 * Manages in-memory state for the current session.
 * All persistence goes through pos-db.client.ts (IndexedDB / Dexie).
 */
import { create } from "zustand";
import type { Transaction } from "./pos-db.client";

export type AppRole = "kasir" | "owner";
export type ActiveCategory = "income" | "expense";

interface POSState {
  // ----- Auth / Role -----
  role: AppRole;
  setRole: (role: AppRole) => void;

  // ----- Display / Input -----
  displayValue: string;
  setDisplayValue: (v: string) => void;
  appendDigit: (digit: string) => void;
  deleteLastDigit: () => void;
  clearDisplay: () => void;

  // ----- Active category chip -----
  activeCategory: ActiveCategory;
  setActiveCategory: (cat: ActiveCategory) => void;

  // ----- Today's session transactions (loaded from DB) -----
  transactions: Transaction[];
  setTransactions: (txs: Transaction[]) => void;
  addTransaction: (tx: Transaction) => void;

  // ----- UI Flags -----
  showPinModal: boolean;
  setShowPinModal: (v: boolean) => void;

  showClosingModal: boolean;
  setShowClosingModal: (v: boolean) => void;

  showSuccessFeedback: string | null;
  setShowSuccessFeedback: (label: string | null) => void;
}

export const usePOSStore = create<POSState>((set) => ({
  role: "kasir",
  setRole: (role) => set({ role }),

  displayValue: "0",
  setDisplayValue: (displayValue) => set({ displayValue }),
  appendDigit: (digit) =>
    set((state) => {
      const cur = state.displayValue;
      if (cur === "0" && digit !== ".") return { displayValue: digit };
      if (digit === "." && cur.includes(".")) return {};
      if (cur.replace(".", "").length >= 12) return {};
      return { displayValue: cur + digit };
    }),
  deleteLastDigit: () =>
    set((state) => {
      const cur = state.displayValue;
      if (cur.length <= 1) return { displayValue: "0" };
      return { displayValue: cur.slice(0, -1) };
    }),
  clearDisplay: () => set({ displayValue: "0" }),

  activeCategory: "income",
  setActiveCategory: (activeCategory) => set({ activeCategory }),

  transactions: [],
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (tx) =>
    set((state) => ({ transactions: [...state.transactions, tx] })),

  showPinModal: false,
  setShowPinModal: (showPinModal) => set({ showPinModal }),

  showClosingModal: false,
  setShowClosingModal: (showClosingModal) => set({ showClosingModal }),

  showSuccessFeedback: null,
  setShowSuccessFeedback: (showSuccessFeedback) => set({ showSuccessFeedback }),
}));
