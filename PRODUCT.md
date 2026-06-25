# CatatAja (C.A.) — Reverse-Procurement POS PWA for Indonesian F&B SMEs

## Identity
- **App Name:** CatatAja (C.A.)
- **Tagline:** Tahu Untung Hari Ini. Bukan Akhir Bulan.
- **Concept:** A calculator-disguised POS system. The main screen is a giant numpad. Cashiers tap menu items or categories to record sales/expenses. Owner gets full profit dashboard via PIN. End of shift = 1-click PDF closing report with smart restock list.
- **Language:** Indonesian (Bahasa Indonesia) for all UI labels

## Target Users
- **Primary:** Indonesian F&B SMEs (UMKM) — warung/resto owners and cashiers
- **Persona A — Kasir (Cashier):** Needs fast input without learning new software. Sees only what they need: numpad + menu buttons + category chips.
- **Persona B — Owner:** Needs daily profit visibility, not just gross revenue. Unlocks full dashboard via PIN.

## The Problem
Indonesian F&B SMEs know today's gross sales (omzet) but are blind to HPP (Harga Pokok Penjualan / Cost of Goods Sold). Owners only discover thin or negative margins at month-end bookkeeping — too late for operational corrections.

## The Solution
CatatAja presents as a simple calculator that cashiers are willing to use (no learning curve), but behind the scenes it records transactions, auto-deducts raw material inventory per recipe, and gives the owner real-time profitability reports. One tap closing = daily PDF report + tomorrow's shopping list.

## Role-Based Access Control (RBAC)
### Kasir (Cashier) — Default Role
- Main screen: giant numpad
- Input via category chips (Pemasukan/Income, Pengeluaran/Expense) or menu item name buttons
- "Closing" button to end the day
- CANNOT see: HPP, margins, total net profit

### Owner — Unlocked via PIN
- Full access after entering PIN (default: 1234, changeable)
- Profitability Dashboard: HPP, per-menu margin, daily net profit
- Recipe Management: link 1 menu portion to raw materials + quantities
- Transaction history and analytics
- Inventory management

## Core Features

### 1. Calculator-First UI
- Home screen = giant numpad (like a phone dialer)
- Cashier types amount → presses category chip or menu item button
- Menu item buttons displayed as rounded chips below numpad
- Categories: "Pemasukan" (green) and "Pengeluaran" (red)
- No loading screens between inputs — instant feedback

### 2. Recipe-Based Auto-Deduct Inventory
- Owner setup: 1 Nasi Goreng = −50gr ayam, −1 butir telur, −2 sdm minyak
- When cashier records "1 Nasi Goreng sold" → system auto-deducts ingredients from inventory
- Inventory tracks stock levels with low-stock alerts

### 3. 1-Click Closing + PDF Generation
- Cashier taps "Closing" → system instantly generates local PDF
- PDF contents: Total Gross Income, Daily Expenses, Items Sold List
- Smart Shopping List: low/empty stock items auto-populate "Rekomendasi Belanja Besok" (Tomorrow's Shopping Recommendations) table
- PDF ready to share directly to WhatsApp Owner
- Uses jsPDF or similar client-side PDF library

### 4. Offline-First PWA
- Runs fully without internet (IndexedDB for persistent storage)
- PWA manifest + service worker for installability
- Works in weak signal areas common in Indonesian warung settings

## Initial Sample Data (seed on first install)
Menu items: Nasi Goreng (Rp 15.000), Es Teh Manis (Rp 5.000), Mie Goreng (Rp 13.000), Ayam Bakar (Rp 20.000), Jus Alpukat (Rp 12.000)
Raw materials: Beras (kg), Ayam (gr), Telur (butir), Minyak Goreng (liter), Teh (sachet), Gula (gr), Alpukat (buah)

## North Star Metric
**Closing Diselesaikan per Minggu** — every closing = daily report generated + auto shopping list + owner knows today's profit.

## Technical Stack
- React + TypeScript (Vite)
- Tailwind CSS for styling
- IndexedDB (via Dexie.js) for offline-first storage
- jsPDF + jspdf-autotable for client-side PDF generation
- PWA: vite-plugin-pwa with service worker
- zustand for state management
