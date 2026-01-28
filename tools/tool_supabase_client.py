import os
import json
from supabase import create_client, Client

# Initialize Supabase Client
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

if not url or not key:
    # Fallback for local testing or if env vars usually set elsewhere
    # In a real scenario, we might raise an error or expect .env loading
    pass

def get_supabase_client() -> Client:
    if not url or not key:
        raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment")
    return create_client(url, key)

def save_parsing_result(file_name: str, source_type: str, parsed_data: dict, analysis_payload: dict = None, file_url: str = None) -> dict:
    """
    Saves the result of a parsing operation to the financial_records table.
    """
    supabase = get_supabase_client()
    
    data = {
        "file_name": file_name,
        "source_type": source_type,
        "parsed_data": parsed_data,
        "analysis_payload": analysis_payload if analysis_payload else {},
        "file_url": file_url
    }
    
    # Insert and return the record
    response = supabase.table("financial_records").insert(data).execute()
    
    if len(response.data) > 0:
        return response.data[0]
    return None

def get_record(record_id: str) -> dict:
    """Retrieves a financial record by ID"""
    supabase = get_supabase_client()
    response = supabase.table("financial_records").select("*").eq("id", record_id).execute()
    if len(response.data) > 0:
        return response.data[0]
    return None

if __name__ == "__main__":
    print("Supabase Client Tool Initialized")
