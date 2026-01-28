# findings.md - Research & Discoveries

## Initialization
*   **Existing Context:** Found `docs/SYSTEM_CONTEXT.md` defining the project goals and architecture.

## Blueprint Phase
*   **User Clarification (Inputs):** 
    *   **Keep:** Excel, PDF, Google Sheets.
    *   **Remove:** PowerPoint (`.pptx`).
    *   **Source of Truth:** Switched from "Upload File" to **Supabase** ("ZupaBase").
*   **Supabase Discovery:**
    *   Found project: `antaruii122's Project`.
    *   Existing tables: `profiles`, `courses`, `youtube_trending`.
    *   **Action:** Need to create `financial_records` table.
*   **Implication:** The Orchestrator must now handle state via Supabase.
    1.  User Uploads ->
    2.  Parse -> 
    3.  **Insert into Supabase `financial_records`** ->
    4.  Analyze ->
    5.  **Update Supabase record** ->
    6.  Frontend reads from Supabase.
