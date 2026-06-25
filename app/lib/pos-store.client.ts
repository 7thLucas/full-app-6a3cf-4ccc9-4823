/**
 * CatatAja — Zustand POS Store
 * Global client-side state for the POS session.
 */
import { create } from "zustand";

export type AppRole = "kasir" | "owner";

interface POSSessionState {
  // Current numpad display value
  display: string;
  // Active role
  role: AppRole;
  // Whether PIN modal is open
  pinModalOpen: boolean;
  // Quick toast message
  toastMsg: string | null;
  // Today's running totals (updated after each transaction)
  todayIncome: number;
  todayExpense: number;
  // Trigger re-fetch of transaction log
  txVersion: number;

  // Actions
  appendDigit: (digit: string) => void;
  backspace: () => void;
  clearDisplay: () => void;
  setRole: (role: AppRole) => void;
  openPinModal: () => void;
  closePinModal: () => void;
  showToast: (msg: string) => void;
  clearToast: () => void;
  setTodayTotals: (income: number, expense: number) => void;
  bumpTxVersion: () => void;
}

export const usePOSStore = create<POSSessionState>((set) => ({
  display: "",
  role: "kasir",
  pinModalOpen: false,
  toastMsg: null,
  todayIncome: 0,
  todayExpense: 0,
  txVersion: 0,

  appendDigit: (digit) =>
    set((s) => {
      const next = s.display + digit;
      // Prevent leading zeros and limit to 12 chars
      if (next.length > 12) return s;
      if (s.display === "" && digit === "0") return s;
      return { display: next };
    }),

  backspace: () =>
    set((s) => ({ display: s.display.slice(0, -1) })),

  clearDisplay: () => set({ display: "" }),

  setRole: (role) => set({ role, pinModalOpen: false }),

  openPinModal: () => set({ pinModalOpen: true }),

  closePinModal: () => set({ pinModalOpen: false }),

  showToast: (msg) => set({ toastMsg: msg }),

  clearToast: () => set({ toastMsg: null }),

  setTodayTotals: (income, expense) =>
    set({ todayIncome: income, todayExpense: expense }),

  bumpTxVersion: () => set((s) => ({ txVersion: s.txVersion + 1 })),
}));
