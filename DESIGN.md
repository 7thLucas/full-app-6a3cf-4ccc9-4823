# CatatAja — Design System

## Color Palette (Apply Strictly)
| Token | Hex | Role |
|---|---|---|
| Main Background | #FED7A5 | Cream/Beige — warm fills, page backgrounds, card surfaces |
| Section Background | #73766A | Sage Green — dark card variants, section headers, badges |
| Primary Action | #9E6752 | Caramel Brown — primary CTA buttons, key accents, active states |
| Secondary Action/Icon | #2D4354 | Dark Navy — secondary UI elements, links, icon colors |
| Outlines & Secondary Text | #534145 | Dark Brown — body copy, borders, secondary labels |
| Main Text/Headers | #20212B | Saturated Black — all headings, primary text |

## Typography
- **Font Family:** Inter (Google Fonts) — clean, highly legible on mobile
- **Display/Hero:** 48px Bold — numpad display number
- **Heading 1:** 24px SemiBold — screen titles
- **Heading 2:** 18px SemiBold — section headers
- **Body:** 16px Regular — general text
- **Caption/Label:** 12px Medium — chip labels, small UI
- **Numpad Keys:** 28px SemiBold — large tap targets

## Spacing & Layout
- Mobile-first, max-width 430px centered on desktop
- Consistent 16px page padding
- 8px base unit grid
- Border radius: 12px for cards, 24px for chips/pills, 8px for buttons
- Generous touch targets: minimum 48px height for all interactive elements

## Component Patterns

### Numpad
- 3-column grid (1-9, 0, backspace, confirm)
- Each key: minimum 72px height, #20212B text, #FED7A5 background with #534145 border
- Active/pressed state: #9E6752 fill, white text
- Display area: large rounded rectangle showing current number, cream background

### Menu Item Chips
- Scrollable horizontal row below numpad
- Pill shape (border-radius: 24px), 48px min height
- Default state: #534145 border, #FED7A5 background
- Active state: #9E6752 fill, white text
- Show item name + price

### Category Chips
- "Pemasukan" (Income): #2D4354 fill, white text
- "Pengeluaran" (Expense): #534145 fill, white text

### Transaction Log
- Each entry: card with white/cream background, left border color-coded
- Income entries: left border #2D4354
- Expense entries: left border #9E6752
- Shows: timestamp, amount, category/item name

### Owner Dashboard Cards
- Background: #73766A (Sage Green)
- Text: white
- Key metrics: large number, small label below
- Net profit highlighted with #FED7A5 accent

### Primary Button (CTA)
- Background: #9E6752 (Caramel Brown)
- Text: white, 16px SemiBold
- Border radius: 12px
- Minimum height: 56px
- Full width on mobile

### Secondary Button
- Background: transparent
- Border: 2px solid #534145
- Text: #534145
- Same size as primary

### PIN Entry Modal
- Centered modal over blur backdrop
- 4-dot PIN indicator (filled = #9E6752, empty = #534145 ring)
- Mini numpad inside modal

### Bottom Navigation (Owner Mode)
- 4 tabs: Kasir, Dashboard, Resep, Inventaris
- Active tab: #9E6752 icon + label
- Inactive: #534145

## Motion & Feedback
- Button press: scale(0.95) + 80ms duration
- Number input: snap/pop animation on display
- Transaction recorded: brief green flash confirmation
- Closing modal: slide-up from bottom

## PWA / Mobile Shell
- Status bar matches #FED7A5 (theme-color meta)
- Splash screen: C.A. logo on #FED7A5 background
- App icon: typographic "C.A." mark on #9E6752 circle

## Tone of Voice
- Indonesian language throughout
- Friendly, direct — no jargon
- Action labels use verbs: "Catat", "Simpan", "Closing", "Lihat Laporan"
- Numbers always formatted as Rupiah: Rp 15.000 (Indonesian number format)
