# gemini.md - Project Constitution

## 1. Project North Star
**Goal:** Create a "Business Intelligence" layer on top of accounting for Chilean Personas/PYMEs.
**Singular Desired Outcome:** Automated Financial Analysis & "Mejoramientos" from Document Uploads, stored via Supabase.

## 2. Data Schemas
### Inputs (Multi-Format Support)
The system must ingest and normalize data from multiple sources into a standard "Financial DataFrame":
1.  **Excel (`.xlsx`, `.csv`)**: Standard "Estado de Resultados".
2.  **Documents (`.pdf`)**: Parsing financial statements from vector or scanned PDFs.
3.  **Google Sheets**: Direct import via URL/Auth.
*(Removed: PowerPoint support per user request)*

### Source of Truth
**Definition:** The "Source of Truth" is **Supabase**.
*   **Database:** `antaruii122's Project` (ID: `baijfzqjgvgbfzuauroi`)
*   **Table:** `financial_records` (New)
*   All uploads must be recorded here. The database record is the master state.

### Supabase Schema: `financial_records`
```sql
create table public.financial_records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  file_name text not null,
  file_url text, -- Storage URL if uploaded
  source_type text check (source_type in ('EXCEL', 'PDF', 'GSHEETS')),
  financial_period text, -- e.g., "2023", "2023-Q1"
  parsed_data jsonb, -- The normalized "DataFrame"
  analysis_payload jsonb, -- The "Insights" & "Mejoramientos"
  created_at timestamptz default now()
);
```

### Standard Output: Analysis Payload (JSON)
```json
{
  "financial_period": "2023",
  "kpis": { "liquidity": 1.2, "gross_margin": 0.35 },
  "insights": [ { "type": "warning", "message": "Gastos Admin > 15%" } ],
  "improvements": [ { "action": "Reducir días calle", "potential_saving": 5000000 } ]
}
```

## 3. Behavioral Rules
1.  **Strict Determinism:** Use 3-Layer Architecture.
2.  **Supabase First:** Check DB before processing. Save results to DB after processing.
3.  **Chilean Context:** Adhere to SII/IFRS/FECU.
4.  **Style:** Glassmorphism, Premium.

## 4. Architectural Invariants
*   **Layer 1 (Directives):** Markdown SOPs.
*   **Layer 2 (Orchestration):** Routing logic (Router -> Parser -> DB).
*   **Layer 3 (Execution):** Python/Node scripts.
    *   `tool_parse_excel.py`, `tool_parse_pdf.py`.
    *   `tool_supabase_client.py`.
*   **Frontend:** Next.js + TailwindCSS.
