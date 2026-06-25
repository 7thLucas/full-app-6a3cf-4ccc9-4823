/*
 * Default Configurable Data — seeded into Mongo on first boot.
 *
 * BEFORE EDITING: read ./RULES.md (especially R5: schema and defaults must
 * stay in sync) and ./configurables.schema.ts. For per-type schema and
 * default-value samples, see RULES.md §5 "Field Type Reference".
 */

export type TBrandColor = {
  // Base
  background: string;
  foreground: string;
  // Card
  card: string;
  cardForeground: string;
  // Popover
  popover: string;
  popoverForeground: string;
  // Primary
  primary: string;
  primaryForeground: string;
  // Secondary
  secondary: string;
  secondaryForeground: string;
  // Muted
  muted: string;
  mutedForeground: string;
  // Accent
  accent: string;
  accentForeground: string;
  // Destructive
  destructive: string;
  destructiveForeground: string;
  // Border / Input / Ring
  border: string;
  input: string;
  ring: string;
  // Charts
  chart1?: string;
  chart2?: string;
  chart3?: string;
  chart4?: string;
  chart5?: string;
  // Navbar
  navbarBackground: string;
  // Sidebar
  sidebarBackground: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
};

export type TFont = {
  headingFont: string;
  textFont: string;
};

export type TMenuItem = {
  id: string;
  name: string;
  price: number;
  category?: string;
  hpp?: number;
  emoji?: string;
};

export type TIngredient = {
  id: string;
  name: string;
  unit: string;
  stock: number;
  minStock: number;
};

export type TDefaultConfigurableData = {
  appName: string;
  tagline?: string;
  logoUrl: string;
  brandColor: TBrandColor;
  font: TFont;
  ownerPin: string;
  businessName?: string;
  currency?: string;
  // UI labels
  closingButtonLabel?: string;
  incomeCategoryLabel?: string;
  expenseCategoryLabel?: string;
  // Feature flags
  showProfitToKasir?: boolean;
  enableInventoryTracking?: boolean;
  enablePdfReport?: boolean;
  whatsappNumber?: string;
  // Data
  menuItems?: TMenuItem[];
  rawMaterials?: TIngredient[];
  expenseCategories?: string[];
  lowStockThreshold?: number;
};

export const defaultConfigurablesData: TDefaultConfigurableData = {
  appName: "CatatAja",
  tagline: "Tahu Untung Hari Ini. Bukan Akhir Bulan.",
  logoUrl: "",
  brandColor: {
    // Base — CatatAja warm cream palette
    background:        "#FED7A5",
    foreground:        "#20212B",
    // Card
    card:              "#73766A",
    cardForeground:    "#ffffff",
    // Popover
    popover:           "#FED7A5",
    popoverForeground: "#20212B",
    // Primary — Caramel Brown
    primary:           "#9E6752",
    primaryForeground: "#ffffff",
    // Secondary — Dark Navy
    secondary:           "#2D4354",
    secondaryForeground: "#ffffff",
    // Muted
    muted:           "#F5C98A",
    mutedForeground: "#534145",
    // Accent — Sage Green
    accent:           "#73766A",
    accentForeground: "#ffffff",
    // Destructive
    destructive:           "#c0392b",
    destructiveForeground: "#ffffff",
    // Border / Input / Ring
    border: "#534145",
    input:  "#F5C98A",
    ring:   "#9E6752",
    // Charts
    chart1: "#9E6752",
    chart2: "#2D4354",
    chart3: "#73766A",
    chart4: "#534145",
    chart5: "#FED7A5",
    // Navbar
    navbarBackground: "#FED7A5",
    // Sidebar
    sidebarBackground:        "#73766A",
    sidebarForeground:        "#ffffff",
    sidebarPrimary:           "#9E6752",
    sidebarPrimaryForeground: "#ffffff",
    sidebarAccent:            "#534145",
    sidebarAccentForeground:  "#ffffff",
    sidebarBorder:            "#534145",
    sidebarRing:              "#9E6752",
  },
  font: {
    headingFont: "Plus Jakarta Sans",
    textFont: "Inter",
  },
  ownerPin: "1234",
  businessName: "Warung Saya",
  currency: "Rp",
  closingButtonLabel: "Tutup Kasir",
  incomeCategoryLabel: "Pemasukan",
  expenseCategoryLabel: "Pengeluaran",
  showProfitToKasir: false,
  enableInventoryTracking: true,
  enablePdfReport: true,
  whatsappNumber: "",
  lowStockThreshold: 20,
  expenseCategories: [
    "Belanja Bahan",
    "Gaji Karyawan",
    "Listrik & Air",
    "Gas",
    "Lain-lain",
  ],
  menuItems: [
    { id: "item-1", name: "Nasi Goreng", price: 15000, hpp: 7000,  category: "Makanan",  emoji: "🍳" },
    { id: "item-2", name: "Mie Goreng",  price: 13000, hpp: 6000,  category: "Makanan",  emoji: "🍜" },
    { id: "item-3", name: "Es Teh Manis",price: 5000,  hpp: 1500,  category: "Minuman",  emoji: "🧊" },
    { id: "item-4", name: "Es Jeruk",    price: 7000,  hpp: 2500,  category: "Minuman",  emoji: "🍊" },
    { id: "item-5", name: "Ayam Bakar",  price: 20000, hpp: 10000, category: "Makanan",  emoji: "🍗" },
    { id: "item-6", name: "Jus Alpukat", price: 12000, hpp: 4000,  category: "Minuman",  emoji: "🥑" },
  ],
  rawMaterials: [
    { id: "ing-1", name: "Beras",         unit: "kg",     stock: 10,   minStock: 2   },
    { id: "ing-2", name: "Ayam",          unit: "gr",     stock: 2000, minStock: 500 },
    { id: "ing-3", name: "Telur",         unit: "butir",  stock: 30,   minStock: 10  },
    { id: "ing-4", name: "Minyak Goreng", unit: "liter",  stock: 5,    minStock: 1   },
    { id: "ing-5", name: "Teh",           unit: "sachet", stock: 50,   minStock: 10  },
    { id: "ing-6", name: "Gula",          unit: "gr",     stock: 1000, minStock: 200 },
    { id: "ing-7", name: "Alpukat",       unit: "buah",   stock: 20,   minStock: 5   },
  ],
};
