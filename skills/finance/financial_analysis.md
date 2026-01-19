---
name: Financial Analysis Skill
description: >
  A comprehensive library of financial ratios, formulas, and "Mejoramientos" (Improvements) 
  strategies tailored for Chilean PYMEs and general company analysis. 
  This skill is the "Directives" layer source of truth.
---

# Financial Analysis Directives

This document defines the standardized set of financial ratios and the logic for suggesting improvements ("Mejoramientos"). These definitions drive the `Orchestration` layer's analysis engine.

## 1. Profitability Ratios (Rentabilidad)
*Focus: Is the company making money?*

### 1.1 Gross Margin (Margen Bruto)
- **Formula:** `(Total Revenue - Cost of Goods Sold) / Total Revenue`
- **Target (General):** > 30% (Varies by industry)
- **Mejoramiento Logic:**
    - `IF < 20%`: "Alerta: Costos directos muy altos. Revisar negociación con proveedores, merma de inventario o estructura de precios."
    - `IF Trending Down`: "Precaución: El costo de venta está creciendo más rápido que las ventas."

### 1.2 Operating Margin (Margen Operacional)
- **Formula:** `(Operating Income / Total Revenue)`
- **Target:** > 10%
- **Mejoramiento Logic:**
    - `IF < 5%`: "Crítico: La operación apenas cubre los gastos fijos. Revisar gastos administrativos (SG&A) y eficiencia operativa."

### 1.3 EBITDA Margin
- **Formula:** `(Internet Income + Interest + Taxes + Depreciation + Amortization) / Total Revenue`
- **Target:** > 15%
- **Mejoramiento Logic:**
    - `IF < 10%`: "Baja generación de caja operativa. Evaluar si la estructura de personal es adecuada para el nivel de ventas."

### 1.4 Net Margin (Margen Neto)
- **Formula:** `Net Income / Total Revenue`
- **Target:** > 5%
- **Mejoramiento Logic:**
    - `IF Negative`: "Pérdida neta. Revisar carga financiera (intereses) y carga tributaria además de lo operacional."

### 1.5 ROA (Return on Assets)
- **Formula:** `Net Income / Total Assets`
- **Mejoramiento Logic:**
    - `IF < IndustryAvg`: "Baja rotación de activos. ¿Tenemos maquinaria parada o exceso de inventario?"

---

## 2. Liquidity Ratios (Liquidez)
*Focus: Can the company pay its bills tomorrow?*

### 2.1 Current Ratio (Razón Corriente)
- **Formula:** `Current Assets / Current Liabilities`
- **Target:** 1.5 - 2.0
- **Mejoramiento Logic:**
    - `IF < 1.0`: "Riesgo de Insolvencia: Los pasivos corto plazo superan los activos. Urgente: Refinanciar deuda a largo plazo o inyectar capital."
    - `IF > 3.0`: "Exceso de Liquidez: Dinero ocioso. Evaluar reinversión o pago de dividendos."

### 2.2 Quick Ratio (Prueba Ácida)
- **Formula:** `(Current Assets - Inventory) / Current Liabilities`
- **Target:** > 1.0
- **Mejoramiento Logic:**
    - `IF < 1.0`: "Dependencia de inventario. Si las ventas bajan, habrá problemas de caja."

### 2.3 Working Capital (Capital de Trabajo)
- **Formula:** `Current Assets - Current Liabilities`
- **Mejoramiento Logic:**
    - `IF Negative`: "Capital de Trabajo Negativo. Necesidad de financiamiento operativo inmediato."

---

## 3. Efficiency Ratios (Eficiencia / Actividad)
*Focus: How well are we using our resources?*

### 3.1 Days Sales Outstanding (DSO / Días Calle)
- **Formula:** `(Accounts Receivable / Total Credit Sales) * 365`
- **Target:** < 45 days (Standard B2B terms)
- **Mejoramiento Logic:**
    - `IF > 60`: "Cobranza lenta. Implementar políticas de cobranza más estrictas, descuentos por pronto pago o factoring."

### 3.2 Inventory Turnover (Rotación de Inventario)
- **Formula:** `Cost of Goods Sold / Average Inventory`
- **Mejoramiento Logic:**
    - `IF Low vs History`: "Inventario estancado. Realizar liquidaciones de stock obsoleto para liberar caja."

### 3.3 Days Payable Outstanding (DPO / Días Proveedores)
- **Formula:** `(Accounts Payable / Cost of Goods Sold) * 365`
- **Mejoramiento Logic:**
    - `IF < 30`: "Pagando muy rápido. Negociar mayores plazos con proveedores para mejorar el Cash Conversion Cycle."

---

## 4. Solvency Ratios (Endeudamiento)
*Focus: Is the company over-leveraged?*

### 4.1 Debt to Equity (Razón Deuda/Patrimonio)
- **Formula:** `Total Liabilities / Shareholders' Equity`
- **Target:** < 1.5
- **Mejoramiento Logic:**
    - `IF > 2.0`: "Alto apalancamiento financiero. Riesgo ante subidas de tasas de interés. Evaluar capitalización."

### 4.2 Interest Coverage (Cobertura de Intereses)
- **Formula:** `EBIT / Interest Expense`
- **Target:** > 3.0
- **Mejoramiento Logic:**
    - `IF < 1.5`: "Peligro: El flujo operativo apenas cubre los intereses. Riesgo de default."

---

## 5. Implementation Strategy (The 'How')

### Data Requirement
To calculate all above, the system needs inputs mapping to standard accounting lines:
- **Income Statement Lines**: Revenue, COGS, OpEx (Admin, Sales), Depreciation, Interest, Taxes.
- **Balance Sheet Lines**: Cash, AR, Inventory, Current Assets, Current Liabilities, Total Assets, Total Liabilities, Equity.

### "Mejoramientos" Engine
The engine will run a `CheckRule(ratio_value)` function for each directive.
- **Input**: Computed Ratio.
- **Output**: Analysis Object `{ status: "OK" | "WARNING" | "CRITICAL", heading: string, description: string, action_item: string }`.
