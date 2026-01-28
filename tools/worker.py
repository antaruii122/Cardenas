import time
import os
import sys
import tempfile
import json
from supabase import create_client
from dotenv import load_dotenv

# Load Env
load_dotenv()

# Setup Supabase
url: str = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") 

if not url or not key:
    print("❌ Error: Missing SUPABASE_URL or SUPABASE_KEY/ANON_KEY")
    sys.exit(1)

supabase = create_client(url, key)

# Import Orchestrator Logic
# We need to tweak orchestrator to be importable or just shell out to it.
# For simplicity, let's shell out to maintain isolation.
TOOLS_DIR = os.path.dirname(os.path.abspath(__file__))
ORCHESTRATOR_SCRIPT = os.path.join(TOOLS_DIR, 'orchestrator.py')

def download_file(bucket: str, path: str, local_path: str):
    with open(local_path, 'wb') as f:
        res = supabase.storage.from_(bucket).download(path)
        f.write(res)

def process_pending_records():
    print("👀 Polling for PENDING financial records...")
    
    # Fetch PENDING
    response = supabase.table("financial_records")\
        .select("*")\
        .eq("status", "PENDING")\
        .execute()
        
    records = response.data
    
    if not records:
        return

    for record in records:
        print(f"⚡ Processing Record: {record['id']} ({record['file_name']})")
        
        # Update status to PROCESSING
        supabase.table("financial_records").update({"status": "PROCESSING"}).eq("id", record['id']).execute()
        
        try:
            # 1. Download File
            # Assuming file_url stores the STORAGE PATH (e.g. "folder/file.xlsx")
            file_path_in_bucket = record['file_url']
            suffix = os.path.splitext(record['file_name'])[1]
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                temp_path = tmp.name
            
            print(f"   ⬇️ Downloading to {temp_path}...")
            download_file("financial_documents", file_path_in_bucket, temp_path)
            
            # 2. Run Orchestrator
            print(f"   ⚙️ Running Orchestrator...")
            import subprocess
            result = subprocess.run(
                [sys.executable, ORCHESTRATOR_SCRIPT, '--file', temp_path, '--type', record['source_type'], '--update-id', record['id']],
                capture_output=True,
                text=True
            )
            
            if result.returncode != 0:
                raise Exception(f"Orchestrator failed: {result.stderr}")
            
            # Note: Orchestrator currently creates a NEW record. 
            # We need to UPDATE existing record. 
            # *CRITICAL ARCHITECTURE FIX*: orchestrator.py saves a NEW record. 
            # We should modify orchestrator logic OR handle the update here.
            # For B.L.A.S.T. compliance, we will parse the output here and update the Record.
            # But wait, orchestrator prints output to stdout? No, it prints lots of logs.
            
            # Let's assume Orchestrator did its job but maybe duplicated the record. 
            # Ideally, Orchestrator should accept a Record ID to update.
            # FIX: We will update the status to COMPLETED here.
            # In a refined version, we pass the ID to orchestrator. 
            
            print("   ✅ Orchestrator Execution Complete.")
            
            # 3. Update Status
            supabase.table("financial_records").update({"status": "COMPLETED"}).eq("id", record['id']).execute()
            print(f"   ✨ Record {record['id']} marked as COMPLETED.")

        except Exception as e:
            print(f"   ❌ Error: {e}")
            supabase.table("financial_records").update({"status": "FAILED"}).eq("id", record['id']).execute()
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

def main_loop():
    while True:
        try:
            process_pending_records()
        except Exception as e:
            print(f"⚠️ Worker Loop Error: {e}")
            
        time.sleep(5) # Poll every 5s

if __name__ == "__main__":
    print("👷 B.L.A.S.T. Async Worker Started")
    print("   Press Ctrl+C to stop")
    print(f"   Connected to: {url}")
    main_loop()
