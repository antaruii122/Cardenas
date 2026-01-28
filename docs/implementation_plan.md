# Implementation Plan - Phase 4: Stylize (Frontend)

# Goal Description
Integrate the "Logic Layer" with the "Presentation Layer" (Next.js).
Since the Logic Layer consists of Python tools, we will use an **Async Worker Pattern**:
1.  **Frontend**: User uploads file -> Save to Supabase Storage -> Insert row in `financial_records` (Status: PENDING).
2.  **Worker (Python)**: Orchestrator watches validation -> Downloads -> Parses -> Analyzes -> Updates Row (Status: COMPLETED).
3.  **Frontend**: Real-time subscription to row updates -> Displays Dashboard.

## User Review Required
> [!IMPORTANT]
> **Architecture Update:** The Frontend will **not** process files directly. It will upload them to Supabase, and the Python tools (running as a background worker) will process them.

## Proposed Changes

### Database Schema
#### [MODIFY] `financial_records`
- Add `status` column (PENDING, PROCESSING, COMPLETED, FAILED).

### Frontend (`execution/frontend`)
#### [NEW] `src/utils/supabase/client.ts`
- Standard Supabase Browser Client.

#### [NEW] `src/components/FinancialUpload.tsx`
- UI: Glassmorphism Card.
- Action: Upload file to Bucket `financial_uploads` (Need to create bucket!).
- Action: Insert row to `financial_records`.

#### [NEW] `src/app/dashboard/page.tsx`
- UI: Glassmorphism Dashboard.
- Fetches `financial_records`.
- Displays KPIs from `analysis_payload`.
- Shows "Mejoramientos" cards.

### Storage
#### [NEW] Bucket: `financial_documents`
- Public/Private bucket for storing user uploads.

## Verification Plan
1.  **Verify Status Column**: Check Supabase Table.
2.  **Verify Bucket**: Check Supabase Storage.
3.  **Frontend Test**:
    - Start Next.js (`npm run dev`).
    - Go to `/dashboard`.
    - Upload File.
    - Verify row created with `PENDING`.
    - *Manually* run `orchestrator.py` (simulating worker).
    - Verify row updates to `COMPLETED` on Frontend.
