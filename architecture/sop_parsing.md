# SOP: Financial Parsing & Normalization

## Objective
Normalize disparate financial inputs (Excel, PDF, Google Sheets) into a canonical JSON structure for analysis.

## Canonical Schema
All parsers must output a dictionary (DataFrame-like) with these keys:

```json
{
  "financial_period": "YYYY or YYYY-MM",
  "currency": "CLP",
  "items": [
    {
      "date": "YYYY-MM-DD",
      "category": "String (e.g., 'Ingresos', 'Costos')",
      "sub_category": "String (Optional)",
      "description": "String",
      "amount": "Float (Negative for expenses)"
    }
  ]
}
```

## Parsing Rules

### 1. Excel (`.xlsx`, `.csv`)
*   **Source of Truth**: Trust the cell values.
*   **Header Detection**: Look for row containing "Fecha", "Detalle", "Monto", "Ingreso", "Egreso".
*   **Normalization**:
    *   Convert all dates to ISO 8601.
    *   Remove thousands separators (dots in Chile).
    *   Ensure numeric types.

### 2. PDF (`.pdf`)
*   **Strategy**: Text extraction first.
*   **Anchor Keywords**: "Estado de Resultados", "Balance General".
*   **Table Detection**: Look for tabular structures. If visual table detection fails, use Regex for line-items.
*   **Fallback**: If unparseable, return error "REQUIRES_MANUAL_REVIEW".

### 3. Google Sheets
*   **Auth**: Use Service Account.
*   **Logic**: Same normalization as Excel.

### 4. Storage & State
*   **Before Parsing**: File must be uploaded/accessible.
*   **After Parsing**: Result MUST be saved to Supabase `financial_records` table via `tool_supabase_client.py`.
