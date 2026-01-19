---
name: Financial Data Validation
description: >
  Directives for normalizing heterogeneous user data (mapping aliases to standard schema) 
  and validating mathematical consistency before analysis.
---

# Data Validation & Normalization Directives

This document defines how the system handles the "messy reality" of user Excels. It involves two steps: **Normalization** (Mapping) and **Validation** (Sanity Check).

## 1. Schema Normalization (The "Rosetta Stone")
We map user column/row names to our Internal Standard Schema.

### 1.1 Revenue Aliases (-> `Total Revenue`)
- Ventas
- Ventas Netas
- Ingresos de Explotación
- Ingresos Operacionales
- Facturación
- Total Ingresos

### 1.2 Cost of Sales Aliases (-> `COGS`)
- Costo de Ventas
- Costo de Explotación
- Costos Directos
- CMV (Costo Mercadería Vendida)

### 1.3 Operating Expenses Aliases (-> `OpEx`)
- Gastos de Administración y Ventas
- Gastos de Administración
- Gastos Generales
- SG&A

### 1.4 Net Income Aliases (-> `Net Income`)
- Utilidad del Ejercicio
- Resultado del Ejercicio
- Ganancia/Pérdida Neta
- Utilidad Neta
- Resultado Final

---

## 2. Mathematical Validation (The "Sanity Check")
Before running any analysis, we must verify the user's Excel math is internally consistent. If these checks fail, we flag the data as "Unreliable" or "Needs Review".

### 2.1 Gross Profit Check
*   **Formula**: `Total Revenue - COGS`
*   **Check**: Does the user's provided "Utilidad Bruta" equal our calculated `Revenue - COGS`?
*   **Tolerance**: Allow < 1% difference (rounding errors).

### 2.2 Operating Profit Check
*   **Formula**: `Gross Profit - OpEx`
*   **Check**: Does user's "Resultado Operacional" match?

### 2.3 Net Income Check
*   **Formula**: `Operating Profit + Other Income - Other Expenses - Taxes - Interest`
*   **Check**: Does user's "Utilidad Neta" match?

---

## 3. Data Quality Flags
The Orchestrator should return these flags:

| Flag | Trigger | Action |
| :--- | :--- | :--- |
| **MISSING_KEY_FIELD** | Cannot find "Revenue" or "Net Income" equivalent. | Halt Analysis. Ask user to map manually. |
| **MATH_MISMATCH** | Calculated row totals differ from User provided totals by > 1%. | Warning: "Tus cálculos no cuadran. Usaremos nuestros valores recalculados." |
| **UNUSUAL_SCALE** | Numbers are effectively 0 or too huge (e.g. Scientific notation). | Warning: "Posible error de escala de unidad (miles vs pesos)." |
