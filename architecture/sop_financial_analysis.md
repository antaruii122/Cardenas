# SOP: Financial Analysis (Chilean Context)

## Objective
Calculate key financial ratios and indicators from the normalized "Financial DataFrame" to assess the health of Personas/PYMEs in Chile.

## Input Data
*   **Source**: `financial_records.parsed_data` (JSON/Dict)
*   **Structure**: List of items with `{ category, description, amount, date }`.

## KPI Definitions

### 1. Solvency (Solvencia)
*   **Current Ratio (Liquidez Corriente)**: `Current Assets / Current Liabilities`
    *   *Target*: > 1.0 (Ideal 1.5 - 2.0)
    *   *Directives*:
        *   If < 1.0: "High Risk of Default"
        *   If > 2.0: "Excess Idle Cash"

### 2. Efficiency (Eficiencia)
*   **Operating Margin (Margen Operacional)**: `(Revenue - Cost of Sales - Admin Exp) / Revenue`
    *   *Target*: Industry dependent (Retail ~10%, Services ~30%)
*   **SGA Ratio**: `SG&A Expenses / Total Revenue`
    *   *Target*: < 20% generally.

### 3. Stability (Estabilidad)
*   **Fixed Cost Coverage**: `Gross Profit / Fixed Costs`
    *   *Goal*: > 1.5x

## Calculation Logic (Python Pseudo-code)
1.  **Filter**: Separate items by `category` (Ingresos, Costos, Gastos).
2.  **Sum**: Calculate Totals (Total Revenue, Total COGS, Total Expenses).
3.  **Ratio**: Compute the divisions defined above.
4.  **Formatting**: Round to 2 decimals.
