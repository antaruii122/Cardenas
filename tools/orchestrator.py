import sys
import os
import json
import subprocess
import tempfile
import argparse
from tool_supabase_client import save_parsing_result

# Paths to tools
TOOLS_DIR = os.path.dirname(os.path.abspath(__file__))
PARSE_EXCEL_TOOL = os.path.join(TOOLS_DIR, 'tool_parse_excel.py')
PARSE_PDF_TOOL = os.path.join(TOOLS_DIR, 'tool_parse_pdf.py')
ANALYZE_TOOL = os.path.join(TOOLS_DIR, 'tool_analyze_finances.py')

def run_tool(script_path, input_arg):
    result = subprocess.run(
        [sys.executable, script_path, '--input', input_arg],
        capture_output=True,
        text=True
    )
    if result.returncode != 0:
        raise Exception(f"Tool failed: {script_path}\nError: {result.stderr}")
    return json.loads(result.stdout)

def process_file(file_path: str, source_type: str, update_record_id: str = None):
    print(f"🚀 [Orchestrator] Starting B.L.A.S.T. pipeline for: {file_path}")
    
    # 1. Parse Input
    print(f"⚙️ [Phase 2: Link] Parsing {source_type}...")
    parsed_data = {}
    
    if source_type == 'EXCEL':
        parsed_data = run_tool(PARSE_EXCEL_TOOL, file_path)
    elif source_type == 'PDF':
        parsed_data = run_tool(PARSE_PDF_TOOL, file_path)
        
    if "error" in parsed_data:
        print(f"❌ Parsing Error: {parsed_data['error']}")
        return

    # 2. Analyze (Architect Layer)
    print(f"🧠 [Phase 3: Architect] Running Logic Engine...")
    
    with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json') as tmp:
        json.dump(parsed_data, tmp)
        tmp_path = tmp.name
        
    analysis_payload = run_tool(ANALYZE_TOOL, tmp_path)
    os.remove(tmp_path) 
    
    # 3. Persist (Update or Insert)
    print(f"💾 [Phase 2: Link] Saving/Updating Supabase...")
    file_name = os.path.basename(file_path)
    
    try:
        from tool_supabase_client import get_supabase_client
        supabase = get_supabase_client()

        if update_record_id:
             # UPDATE existing record
             data = {
                "parsed_data": parsed_data,
                "analysis_payload": analysis_payload,
                # status updated by worker, but we can do intermediate if needed
             }
             supabase.table("financial_records").update(data).eq("id", update_record_id).execute()
             print(f"✅ Success! Updated Record ID: {update_record_id}")
        else:
            # INSERT new record (manual run)
            record = save_parsing_result(
                file_name=file_name,
                source_type=source_type,
                parsed_data=parsed_data,
                analysis_payload=analysis_payload,
                file_url=file_path
            )
            print(f"✅ Success! Created Record ID: {record['id']}")
            
        print(f"📊 Insights Generated: {len(analysis_payload.get('improvements', []))} improvements found.")
        
    except Exception as e:
        print(f"⚠️ Supabase Error: {e}")
        print(json.dumps(analysis_payload, indent=2))

def main():
    parser = argparse.ArgumentParser(description='B.L.A.S.T. Orchestrator')
    parser.add_argument('--file', required=True, help='Path to file')
    parser.add_argument('--type', required=True, choices=['EXCEL', 'PDF'], help='File Type')
    parser.add_argument('--update-id', help='Supabase Record ID to update')
    args = parser.parse_args()
    
    process_file(args.file, args.type, args.update_id)

if __name__ == "__main__":
    main()
