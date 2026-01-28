# 🚀 B.L.A.S.T. System - Operation Manual

## 1. System Architecture
*   **Source of Truth:** Supabase (`financial_records` table).
*   **Frontend:** Next.js Dashboard (Glassmorphism).
*   **Backend:** Python Async Worker (`tools/worker.py`).

## 2. Startup Instructions

### Step 1: Start the Frontend (Terminal 1)
```bash
cd execution/frontend
npm run dev
# Open http://localhost:3000/dashboard
```

### Step 2: Start the Logic Worker (Terminal 2)
This worker polls the database for new uploads and processes them.
```bash
# Install dependencies first if you haven't
pip install -r tools/requirements.txt

# Run the worker
python tools/worker.py
```

## 3. Usage Flow
1.  Go to the Dashboard.
2.  Drag & Drop an Excel or PDF.
3.  Status will show "PENDING".
4.  Watch Terminal 2: The worker will pick it up, run the B.L.A.S.T. pipeline, and update Supabase.
5.  Dashboard status will change to "COMPLETED" and show Insights.
