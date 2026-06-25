/* START: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */
export interface FieldSchemaType {
  fieldName?: string;
  type:
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "array"
    | "color"
    | "url"
    | "enum"
    | "datetime"
    | "file"
    | "files";
  required?: boolean;
  label?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
  fields?: FieldSchemaType[];
  item?: FieldSchemaType;
}
/* END: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */

export type ConfigurableSchemas = {
  formSchema: FieldSchemaType[];
};



export const configurableSchemas: ConfigurableSchemas = {
  formSchema: [
    {
      fieldName: "appName",
      type: "string",
      required: true,
      label: "App Name",
    },
    {
      fieldName: "logoUrl",
      type: "url",
      required: true,
      label: "Logo URL",
    },
    {
      fieldName: "brandColor",
      type: "object",
      required: true,
      label: "Brand Color",
      fields: [
        // ── Base ────────────────────────────────────────────────────────────
        { fieldName: "background",        type: "color", required: true,  label: "Background" },
        { fieldName: "foreground",        type: "color", required: true,  label: "Foreground" },
        // ── Card ────────────────────────────────────────────────────────────
        { fieldName: "card",              type: "color", required: true,  label: "Card" },
        { fieldName: "cardForeground",    type: "color", required: true,  label: "Card Foreground" },
        // ── Popover ─────────────────────────────────────────────────────────
        { fieldName: "popover",           type: "color", required: true,  label: "Popover" },
        { fieldName: "popoverForeground", type: "color", required: true,  label: "Popover Foreground" },
        // ── Primary ─────────────────────────────────────────────────────────
        { fieldName: "primary",           type: "color", required: true,  label: "Primary" },
        { fieldName: "primaryForeground", type: "color", required: true,  label: "Primary Foreground" },
        // ── Secondary ───────────────────────────────────────────────────────
        { fieldName: "secondary",           type: "color", required: true,  label: "Secondary" },
        { fieldName: "secondaryForeground", type: "color", required: true,  label: "Secondary Foreground" },
        // ── Muted ───────────────────────────────────────────────────────────
        { fieldName: "muted",           type: "color", required: true,  label: "Muted" },
        { fieldName: "mutedForeground", type: "color", required: true,  label: "Muted Foreground" },
        // ── Accent ──────────────────────────────────────────────────────────
        { fieldName: "accent",           type: "color", required: true,  label: "Accent" },
        { fieldName: "accentForeground", type: "color", required: true,  label: "Accent Foreground" },
        // ── Destructive ─────────────────────────────────────────────────────
        { fieldName: "destructive",           type: "color", required: true,  label: "Destructive" },
        { fieldName: "destructiveForeground", type: "color", required: true,  label: "Destructive Foreground" },
        // ── Border / Input / Ring ────────────────────────────────────────────
        { fieldName: "border", type: "color", required: true, label: "Border" },
        { fieldName: "input",  type: "color", required: true, label: "Input" },
        { fieldName: "ring",   type: "color", required: true, label: "Ring" },
        // ── Charts ──────────────────────────────────────────────────────────
        { fieldName: "chart1", type: "color", required: false, label: "Chart 1" },
        { fieldName: "chart2", type: "color", required: false, label: "Chart 2" },
        { fieldName: "chart3", type: "color", required: false, label: "Chart 3" },
        { fieldName: "chart4", type: "color", required: false, label: "Chart 4" },
        { fieldName: "chart5", type: "color", required: false, label: "Chart 5" },
        // ── Navbar ──────────────────────────────────────────────────────────
        { fieldName: "navbarBackground", type: "color", required: true, label: "Navbar Background" },
        // ── Sidebar ─────────────────────────────────────────────────────────
        { fieldName: "sidebarBackground",        type: "color", required: true,  label: "Sidebar Background" },
        { fieldName: "sidebarForeground",        type: "color", required: true,  label: "Sidebar Foreground" },
        { fieldName: "sidebarPrimary",           type: "color", required: true,  label: "Sidebar Primary" },
        { fieldName: "sidebarPrimaryForeground", type: "color", required: true,  label: "Sidebar Primary Foreground" },
        { fieldName: "sidebarAccent",            type: "color", required: true,  label: "Sidebar Accent" },
        { fieldName: "sidebarAccentForeground",  type: "color", required: true,  label: "Sidebar Accent Foreground" },
        { fieldName: "sidebarBorder",            type: "color", required: true,  label: "Sidebar Border" },
        { fieldName: "sidebarRing",              type: "color", required: true,  label: "Sidebar Ring" },
      ],
    },

    {
      fieldName: "font",
      type: "object",
      required: true,
      label: "Typography",
      fields: [
        {
          fieldName: "headingFont",
          type: "enum",
          required: true,
          label: "Heading Font",
          options: [
            "Inter",
            "Inter Tight",
            "Plus Jakarta Sans",
            "Poppins",
            "Montserrat",
            "Raleway",
            "Playfair Display",
            "Lora",
            "Merriweather",
            "EB Garamond",
            "Cinzel",
            "Cormorant Garamond",
            "Libre Baskerville",
            "PT Serif",
            "Nunito",
            "Outfit",
            "DM Sans",
            "Sora",
            "Space Grotesk",
            "Josefin Sans",
            "Rubik",
            "Quicksand",
            "Figtree",
            "Lexend",
          ],
        },
        {
          fieldName: "textFont",
          type: "enum",
          required: true,
          label: "Text Font",
          options: [
            "Inter",
            "Inter Tight",
            "Plus Jakarta Sans",
            "Poppins",
            "Montserrat",
            "Raleway",
            "Lora",
            "Merriweather",
            "EB Garamond",
            "Libre Baskerville",
            "PT Serif",
            "Nunito",
            "Outfit",
            "DM Sans",
            "Sora",
            "Source Sans 3",
            "Noto Sans",
            "Lato",
            "Open Sans",
            "Roboto",
            "Rubik",
            "Quicksand",
            "Figtree",
            "Lexend",
          ],
        },
      ],
    },
    // ── CatatAja App Config ─────────────────────────────────────────────────
    {
      fieldName: "tagline",
      type: "string",
      required: false,
      label: "Tagline",
      maxLength: 200,
    },
    {
      fieldName: "businessName",
      type: "string",
      required: true,
      label: "Nama Bisnis",
      maxLength: 100,
    },
    {
      fieldName: "currency",
      type: "string",
      required: true,
      label: "Simbol Mata Uang",
      maxLength: 10,
    },
    {
      fieldName: "ownerPin",
      type: "string",
      required: true,
      label: "PIN Owner",
      minLength: 4,
      maxLength: 8,
    },
    {
      fieldName: "closingButtonLabel",
      type: "string",
      required: true,
      label: "Label Tombol Closing",
      maxLength: 30,
    },
    {
      fieldName: "incomeCategoryLabel",
      type: "string",
      required: true,
      label: "Label Kategori Pemasukan",
      maxLength: 30,
    },
    {
      fieldName: "expenseCategoryLabel",
      type: "string",
      required: true,
      label: "Label Kategori Pengeluaran",
      maxLength: 30,
    },
    {
      fieldName: "showProfitToKasir",
      type: "boolean",
      required: false,
      label: "Tampilkan Profit ke Kasir",
    },
    {
      fieldName: "enableInventoryTracking",
      type: "boolean",
      required: false,
      label: "Aktifkan Pelacakan Inventori",
    },
    {
      fieldName: "enablePdfReport",
      type: "boolean",
      required: false,
      label: "Aktifkan Laporan PDF",
    },
    {
      fieldName: "whatsappNumber",
      type: "string",
      required: false,
      label: "Nomor WhatsApp (untuk share laporan)",
      maxLength: 20,
    },
    {
      fieldName: "menuItems",
      type: "array",
      label: "Menu Items",
      item: {
        type: "object",
        fields: [
          { fieldName: "id",       type: "string", required: true,  label: "ID" },
          { fieldName: "name",     type: "string", required: true,  label: "Nama Menu" },
          { fieldName: "price",    type: "number", required: true,  label: "Harga Jual (Rp)", min: 0 },
          { fieldName: "category", type: "string", required: true,  label: "Kategori" },
          { fieldName: "hpp",      type: "number", required: false, label: "HPP (Rp)", min: 0 },
          { fieldName: "emoji",    type: "string", required: false, label: "Emoji" },
        ],
      },
    },
    {
      fieldName: "expenseCategories",
      type: "array",
      label: "Kategori Pengeluaran",
      item: { type: "string", required: true },
    },
    {
      fieldName: "lowStockThreshold",
      type: "number",
      required: false,
      label: "Batas Stok Kritis (unit minimum default)",
      min: 0,
    },
    {
      fieldName: "rawMaterials",
      type: "array",
      label: "Bahan Baku / Inventori",
      item: {
        type: "object",
        fields: [
          { fieldName: "id",       type: "string", required: true,  label: "ID" },
          { fieldName: "name",     type: "string", required: true,  label: "Nama Bahan" },
          { fieldName: "unit",     type: "string", required: true,  label: "Satuan" },
          { fieldName: "stock",    type: "number", required: true,  label: "Stok Awal", min: 0 },
          { fieldName: "minStock", type: "number", required: true,  label: "Stok Minimum", min: 0 },
        ],
      },
    },
  ],
};