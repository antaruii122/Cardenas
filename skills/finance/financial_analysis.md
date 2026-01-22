---
name: Financial Analysis Skill
description: >
  Directives for the Expert Financial Analyst engine. Contains official formulas, 
  interpretation logic (Traffic Lights), and strategic improvement advice 
  tailored for Chilean SMEs (IFRS).
---

# Expert Financial Analysis Directives

This document acts as the **Logic Layer** for the Antigravity Financial Engine. 
It defines HOW to calculate metrics and HOW to interpret them.

## 1. Profitability Metrics (Rentabilidad)
*Goal: Measure the company's ability to generate earnings relative to revenue, assets, and equity.*

### 1.1 Gross Margin (Margen Bruto)
- **Formula**: `(Ingresos de Explotación - Costo de Ventas) / Ingresos de Explotación`
- **Benchmark (General)**: > 30%
- **Traffic Light**:
    - 🟢 **Good**: > 30%
    - 🟡 **Warning**: 15% - 30%
    - 🔴 **Critical**: < 15%
- **Insight Template**: "Tu Margen Bruto es del {value}%. {status_text}. Esto indica {interpretation}."
- **Improvement Actions**: 
    - "Renegociar costos con proveedores clave."
    - "Revisar política de precios."
    - "Auditar merma de inventario."

### 1.2 Operating Margin (Margen Operacional)
- **Formula**: `Resultado Operacional / Ingresos de Explotación`
- **Benchmark**: > 10%
- **Traffic Light**:
    - 🟢 > 10%
    - 🟡 5% - 10%
    - 🔴 < 5%

### 1.3 Net Margin (Margen Neto)
- **Formula**: `Utilidad del Ejercicio / Ingresos de Explotación`
- **Benchmark**: > 5%
- **Traffic Light**:
    - 🟢 > 8%
    - 🟡 2% - 8%
    - 🔴 < 2%

### 1.4 ROE (Return on Equity)
- **Formula**: `Utilidad del Ejercicio / Patrimonio Total`
- **Benchmark**: > 15%
- **Traffic Light**:
    - 🟢 > 15%
    - 🟡 8% - 15%
    - 🔴 < 8%

### 1.5 EBITDA Margin (Proxy)
- **Formula**: `(Resultado Operacional + Depreciación + Amortización) / Ingresos de Explotación`
- **Note**: If Dep/Amort not available, use Operating Margin as proxy floor.

---

## 2. Liquidity Metrics (Liquidez)
*Goal: Measure ability to meet short-term obligations.*

### 2.1 Current Ratio (Razón Corriente)
- **Formula**: `Activos Corrientes / Pasivos Corrientes`
- **Benchmark**: 1.5 - 2.0
- **Traffic Light**:
    - 🟢 > 1.5 (Healthy)
    - 🟡 1.0 - 1.5 (Tight)
    - 🔴 < 1.0 (Insolvent - CRITICAL)

### 2.2 Quick Ratio (Prueba Ácida)
- **Formula**: `(Activos Corrientes - Inventarios) / Pasivos Corrientes`
- **Benchmark**: > 1.0
- **Traffic Light**:
    - 🟢 > 1.0
    - 🟡 0.6 - 1.0
    - 🔴 < 0.6

---

## 3. Efficiency Metrics (Eficiencia)
*Goal: Measure how well the company uses its assets.*

### 3.1 Days Sales Outstanding (DSO)
- **Formula**: `(Cuentas por Cobrar / Ingresos de Explotación) * 365`
- **Benchmark**: < 45 days
- **Traffic Light**:
    - 🟢 < 45 days
    - 🟡 45 - 60 days
    - 🔴 > 60 days (Cash Trap)

### 3.2 Inventory Turnover (Rotación Inventario)
- **Formula**: `Costo de Ventas / Inventario Promedio`
- **Benchmark**: Industry Dependent (High is usually better)

---

## 4. Leverage Metrics (Solvencia)
*Goal: Measure financial risk and debt levels.*

### 4.1 Debt-to-Equity (Razón Deuda/Patrimonio)
- **Formula**: `Pasivos Totales / Patrimonio Total`
- **Benchmark**: < 1.5
- **Traffic Light**:
    - 🟢 < 1.0
    - 🟡 1.0 - 2.0
    - 🔴 > 2.0 (High Leverage Risk)

---

## 5. Strategic Recommendations Engine

The system should output specific advice based on the combination of flags:

1. **"The Profit Trap"** (High Gross Margin, Low Net Margin)
   - *Diagnosis*: Your core business is healthy, but overhead or debt is eating your profits.
   - *Action*: Audit SG&A (Administrative expenses) and refinance high-interest debt.

2. **"The Cash Crunch"** (Profitable but Low Liquidity)
   - *Diagnosis*: You are making money on paper but running out of cash.
   - *Action*: Focus on collections (DSO) and inventory management. Growth is consuming your cash.

3. **"The Distress Signal"** (Low Margins + High Debt)
   - *Diagnosis*: Critical vulnerability.
   - *Action*: Immediate restructuring required. Pause all CapEx. Focus strictly on cash generation.
