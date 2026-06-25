# CatatAja (C.A.) — Product Overview

## Identity
- **App Name:** CatatAja (C.A.)
- **Tagline:** Tahu Untung Hari Ini. Bukan Akhir Bulan.
- **Concept:** Reverse-Procurement POS yang menyamar sebagai kalkulator sederhana
- **Logo:** Tipografi "C.A." — modern, clean, typographic mark

## Design System
| Token | Hex | Role |
|---|---|---|
| Main Background | #FED7A5 | Cream/Beige — warm fills, card backgrounds |
| Section Background | #73766A | Sage Green — dark card variants, badges |
| Primary Action | #9E6752 | Caramel Brown — primary buttons, key accents |
| Secondary Action/Icon | #2D4354 | Dark Navy — secondary UI, link colors |
| Outlines & Secondary Text | #534145 | Dark Brown — body copy, borders |
| Main Text/Headers | #20212B | Saturated Black — all headings |

## Target Users
- **Primary:** UMKM F&B — owner dan kasir warung/resto kecil
- **Scope:** 100% internal (bukan untuk pelanggan)
- **Persona A — Kasir:** Butuh cara input cepat tanpa belajar software baru
- **Persona B — Owner:** Butuh visibilitas profit harian, bukan hanya omzet

## The Problem
UMKM F&B tahu omzet (gross sales) hari ini, tapi buta terhadap HPP (Harga Pokok Penjualan). Akibatnya: owner baru sadar margin negatif atau tipis setelah pembukuan akhir bulan — terlalu terlambat untuk koreksi operasional.

## The Solution
CatatAja hadir sebagai kalkulator yang kasir mau pakai karena tidak rumit — tapi di baliknya mencatat transaksi, memotong stok bahan baku secara otomatis, dan memberi owner laporan profitabilitas real-time. Satu ketukan closing = PDF laporan harian + daftar belanja besok dikirim ke WhatsApp.

## Role-Based Access Control (RBAC)
### Kasir
- Layar utama: numpad raksasa
- Input via chip kategori (Pemasukan, Pengeluaran) atau tombol nama menu
- Tombol Closing untuk tutup hari
- **Tidak dapat melihat:** HPP, margin, total keuntungan kas

### Owner
- Akses penuh via PIN
- Dashboard Profitabilitas: HPP, margin per menu, keuntungan kas harian
- Pengaturan Resep (Recipe): kaitkan 1 porsi menu dengan bahan baku + kuantitas
- History transaksi dan analytics

## Core Features

### 1. Calculator-First UI
Layar utama adalah numpad besar. Kasir ketik angka → tekan chip kategori atau tombol nama menu. Tidak ada loading screen antar input.

### 2. Recipe-Based Auto Deduct
- Owner setup: 1 Nasi Goreng = −50gr ayam, −1 butir telur
- Saat kasir input "1 Nasi Goreng Terjual" → database inventory background langsung memotong stok secara otomatis

### 3. 1-Click Closing & PDF Generator
- Kasir tekan "Closing" → sistem generate PDF lokal secara instan
- Isi PDF: Total Pemasukan Gross, Pengeluaran Harian, Data Menu Terjual
- **Smart Shopping List:** stok yang habis/kritis otomatis masuk tabel "Rekomendasi Belanja Besok"
- PDF siap di-share langsung ke WhatsApp Owner

### 4. Offline-First (PWA)
- Berjalan penuh tanpa koneksi internet (local state via browser storage)
- Sinkronisasi ke server saat koneksi stabil atau saat Closing

## Technical Architecture
- **Platform:** Progressive Web App (PWA) — mobile browser first
- **Offline:** Local state (IndexedDB / localStorage equivalent)
- **Sync:** Server sync on stable connection or at Closing
- **Auth:** PIN-based role switching (Owner vs Kasir)

## Strategic Principles
1. **Simplicity over features** — kasir tidak boleh bingung layar pertama
2. **Profit visibility** — owner harus bisa lihat margin real tanpa buka Excel
3. **Zero friction closing** — laporan harian tidak boleh butuh lebih dari 1 tap
4. **Offline-first** — warung di area sinyal buruk pun harus bisa pakai

## North Star Metric
**Closing Diselesaikan per Minggu** — setiap closing = laporan harian terbuat + daftar belanja otomatis tergenerate + owner tahu profit hari itu.

Secondary: **Transaksi Dicatat per Hari** — volume input kasir, ukur adopsi di level operasional.
