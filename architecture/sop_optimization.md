# SOP: Optimization & Improvements (Mejoramientos)

## Objective
Generate actionable advice ("Mejoramientos") based on the calculated KPIs and raw financial data.

## Rules Engine

### Rule 1: High Fixed Costs
*   **Trigger**: `Fixed Costs > 50% of Total Revenue`.
*   **Advice**: "Reduce Gastos Fijos (Arriendos, Suscripciones). Revisa contratos de servicios."
*   **Action Type**: `COST_REDUCTION`

### Rule 2: Low Liquidity
*   **Trigger**: `Current Ratio < 1.0`.
*   **Advice**: "Riesgo de Caja inminente. Negociar plazos de pago con proveedores o acelerar cobranza."
*   **Action Type**: `CASH_FLOW`

### Rule 3: Tax Efficiency (Chile)
*   **Trigger**: `Profit > 0` AND `No 'PPM' or 'Tax' detailed`.
*   **Advice**: "Recuerda provisionar el Pago Provisional Mensual (PPM) para evitar carga fiscal fuerte en Abril."
*   **Action Type**: `COMPLIANCE`

### Output Format
```json
[
  {
    "rule_id": "HIGH_FIXED_COSTS",
    "severity": "HIGH",
    "title": "Gastos Fijos Elevados",
    "message": "Tus gastos fijos consumen más del 50% de tus ventas.",
    "actionable_step": "Audita tus suscripciones y re-negocia el arriendo."
  }
]
```
