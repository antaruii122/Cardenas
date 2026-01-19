---
name: Generate S.E.E. Report
description: Logic for calculating Solvency, Stability, and Efficiency metrics from a P&L statement when Balance Sheet data is missing.
---

# Generate S.E.E. Report Skill

This skill defines the standard logic for the "Reporte S.E.E." (Solvencia, Estabilidad, Eficiencia) used in Antigravity Finance.

## Context
Many SMEs only have a Profit & Loss (P&L) statement. To provide a complete health check, we use P&L proxies to estimate financial health metrics usually derived from a Balance Sheet.

## Metrics Logic

### 1. Solvencia (Solvency)
*Definition*: The ability of the company to meet its long-term financial obligations.
*Proxy Metric*: **Interest Coverage Ratio**
*Formula*: `Operating Profit (EBIT) / Interest Expenses`
*Interpretation*:
- **> 3.0x**: Sólida. (Can pay interest 3 times over).
- **1.5x - 3.0x**: Aceptable.
- **< 1.5x**: Riesgosa. (Vulnerable to revenue drops).

### 2. Estabilidad (Stability)
*Definition*: The ability of the business model to sustain itself without burning cash.
*Proxy Metric*: **Fixed Cost Coverage**
*Formula*: `Gross Profit / Operational Expenses (OpEx)`
*Interpretation*:
- **> 1.2x**: Estable. (Gross profit covers all OpEx with room to spare).
- **1.0x - 1.2x**: Ajustada. (Breakeven territory).
- **< 1.0x**: Inestable. (Burning cash on operations).

### 3. Eficiencia (Efficiency)
*Definition*: How well the company uses resources to generate revenue.
*Proxy Metric*: **OpEx Ratio**
*Formula*: `Operational Expenses / Revenue`
*Interpretation*:
- **< 20%**: Alta. (Very lean operation).
- **20% - 40%**: Media. (Standard).
- **> 40%**: Baja. (Heavy structure relative to sales).

## Usage
When implementing this analysis in code (e.g., React components), ALWAYS use these specific formulas and threshold values to ensure consistency across the platform.
