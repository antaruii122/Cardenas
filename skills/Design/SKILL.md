---
name: frontend-design
description: Strict guidelines for the "Antigravity" Premium Financial Dashboard. MANDATORY: Use Deep Dark Theme, Bento Grid Layouts, and Glassmorphism.

## Antigravity Design System (MANDATORY)

You are building a **Premium Financial Analytics Platform**. The aesthetic is "Futurist Minimalist".
**Rule #1**: NO LIGHT MODE. The application is strictly **Dark Mode**.
**Rule #2**: NO GENERIC "DASHBOARD" CARDS. Use **Bento Grids** and **Glassmorphism**.

### 1. Color Palette (Strict)
- **Background**: `bg-[#0B0F17]` (Deep Midnight). NEVER use pure black (`#000`).
- **Cards/Surfaces**: `bg-[#111620]` or `bg-[#151B26]`.
    - **Glass Style**: `bg-opacity-40 backdrop-blur-md border border-white/5` (Use `border-slate-800/50` if needed).
- **Text**:
    - Primary: `text-white` or `text-gray-100` (High Contrast).
    - Secondary: `text-gray-400` (Subtle).
    - **NEVER** use dark gray text on dark background. Contrast must be readable.
- **Accents**:
    - Primary Brand: `text-blue-400` / `bg-blue-500`.
    - Profit/Good: `text-emerald-400`.
    - Loss/Bad: `text-rose-400`.

### 2. Layout (The "Bento" Grid)
- Use **CSS Grid** (`grid-cols-1 md:grid-cols-3 gap-6`).
- **Executive Summary**: Full width (`col-span-3`).
- **Main Visuals**: Center focus (`col-span-2`).
- **Insights/Lists**: Side column (`col-span-1`).
- **Spacing**: Use `gap-6` or `gap-8`. "Airy" but dense data.

### 3. Typography
- **Font**: Inter, Manrope, or Outfit (Clean Sans-Serif).
- **Headings**: `font-medium tracking-tight`. Don't use bold everywhere.
- **Numbers**: Monospace or Tabular nums (`tabular-nums`) for tables.

### 4. Components
- **Buttons**: Minimalist. `hover:bg-white/5`.
- **Charts**:
    - Hide grids (`cartesianGrid stroke="#333" strokeDasharray="3 3"`).
    - Use Gradients for areas.
    - Tooltips: Dark background (`bg-slate-900 border border-slate-800`).
- **Tables**:
    - No Zebra striping unless barely visible (`hover:bg-white/5`).
    - Thin borders (`border-b border-white/5`).

### 5. "Premium" Details
- **Gradients**: Use subtle radial gradients in the background to create depth (e.g., a faint blue glow in the top-right corner).
- **Icons**: Lucide React. Thin stroke (`1.5px`).
- **Borders**: Extremely subtle (`border-white/5` or `border-white/10`).

**FAILURE CONDITIONS**:
- White backgrounds.
- Low contrast text.
- "Boxy" generic bootstrap-style layouts.
- Cluttered interfaces.
