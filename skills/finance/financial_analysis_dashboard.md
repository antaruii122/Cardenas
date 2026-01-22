---
name: Financial Analysis & Clay UI Design
description: Expert-level instructions for calculating financial ratios and implementing high-density "Clay-like" data tables.
---

# 1. Financial Ratios (The "Level 10" Standard)

When analyzing financial statements, ALWAYS attempt to calculate the following. If data is missing for a numerator/denominator, return `null`, never `0`.

## Liquidity (Short Term Health)
- **Current Ratio**: `Current Assets / Current Liabilities`. (Ideal: 1.5 - 2.0)
- **Quick Ratio (Acid Test)**: `(Current Assets - Inventory) / Current Liabilities`. (Ideal: > 1.0)
- **Cash Ratio**: `Cash & Equivalents / Current Liabilities`. (Ideal: > 0.2)
- **Net Working Capital**: `Current Assets - Current Liabilities`. (Should be positive)

## Efficiency (Operational Performance)
- **Receivables Turnover**: `Revenue / Average Accounts Receivable`.
- **DSO (Days Sales Outstanding)**: `365 / Receivables Turnover`. (Lower is better)
- **Inventory Turnover**: `COGS / Average Inventory`.
- **DIO (Days Inventory Outstanding)**: `365 / Inventory Turnover`.
- **Payables Turnover**: `COGS / Average Accounts Payable`.
- **DPO (Days Payables Outstanding)**: `365 / Payables Turnover`.
- **Cash Conversion Cycle (CCC)**: `DIO + DSO - DPO`. (Lower/Negative is better)
- **Asset Turnover**: `Revenue / Total Assets`.

## Profitability (Margins & Returns)
- **Gross Margin**: `Gross Profit / Revenue`.
- **Operating Margin**: `Operating Income (EBIT) / Revenue`.
- **EBITDA Margin**: `EBITDA / Revenue`.
- **Net Profit Margin**: `Net Income / Revenue`.
- **ROA (Return on Assets)**: `Net Income / Total Assets`.
- **ROE (Return on Equity)**: `Net Income / Shareholders Equity`.

## Solvency (Long Term Structure)
- **Debt-to-Equity**: `Total Liabilities / Shareholders Equity`. (Ideal: < 1.0 for most industries)
- **Debt Ratio**: `Total Liabilities / Total Assets`.
- **Interest Coverage Ratio**: `EBIT / Interest Expense`. (Ideal: > 1.5)

---

# 2. "Clay-like" UI Patterns (The Visual Standard)

"Clay" refers to a UI aesthetic that manages high information density with high readability.

## Key Principles:
1.  **Dense but Breathable**: 
    - Use `text-xs` (12px) or `text-sm` (14px) for data.
    - Use generous `py-2` or `py-3` spacing, but tight `px-4`.
    - Font: Monospaced (e.g., `font-mono`) for all numbers. Sans-serif for labels.

2.  **Scalable Layouts (Horizontal)**:
    - **Few Columns (< 5)**: Table takes full width. Columns share space (`flex-1` or grid). Minimal whitespace issues.
    - **Many Columns (> 10)**: 
        - Container: `overflow-x-auto`.
        - **Sticky Context**: The first column ("Concepto") MUST be `sticky left-0 bg-background z-10`. This ensures the user never loses track of what row they are reading.
        - **Sticky Summary**: Optionally, the last column ("Variance" or "Total") can be `sticky right-0`.

3.  **Visual Hierarchy**:
    - **Headers**: Text-muted, uppercase, tracking-wider, small.
    - **Totals (Rows)**: `font-bold`, slightly brighter text color.
    - **Negative Values**: `text-rose-500` (soft red), possibly with `()` format or `-`.
    - **Zebra Striping**: **Avoid** strict zebra striping (it looks dated). Use **Hover Highlighting** (`hover:bg-white/5`) instead for cleaner look.

4.  **Interactive Elements**:
    - **Tooltips**: Every calculated metric must have a tooltip showing the formula/source.
    - **Click-to-Copy**: Cells should be clickable to copy value.
    - **Drill Down**: Rows that are aggregates (e.g., "Total OpEx") should be expandable (Accordion style) if data allows.

# 3. Code Implementation Style (React/Tailwind)

```tsx
// Example of a Clay-like Row
<tr className="group border-b border-white/5 hover:bg-white-[0.02] transition-colors">
  <td className="sticky left-0 bg-[#0B0F17] group-hover:bg-[#151B26] z-20 py-2 px-4 font-medium text-gray-300 shadow-[2px_0_5px_rgba(0,0,0,0.2)]">
    Revenue
  </td>
  <td className="py-2 px-4 text-right font-mono text-gray-400">
    $1.200.000
  </td>
  {/* ... more columns ... */}
</tr>
```
