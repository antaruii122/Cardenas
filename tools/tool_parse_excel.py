import pandas as pd
import sys
import json
import argparse
from datetime import datetime

def parse_financial_matrix(df: pd.DataFrame) -> dict:
    """
    Parses complex Financial Statements (Balance Sheets, P&L) where dates are headers
    and descriptions are in rows. Handles multiple tables in one sheet (side-by-side).
    """
    # 1. Identify Date Columns (Headers)
    # We look at the first few rows to find dates like "31/Oct/2025" or "Oct 2025"
    date_map = {} # {col_index: 'YYYY-MM-DD'}
    
    # Heuristic: Scan first 10 rows for date patterns
    for r_idx, row in df.head(10).iterrows():
        for c_idx, val in enumerate(row):
            val_str = str(val).strip()
            # Try parsing various date formats common in reports
            parsed_date = None
            try:
                # Common formats: dd/mm/yyyy, Month YYYY, etc.
                # Just catch keywords first
                if isinstance(val, datetime):
                    parsed_date = val
                else:
                    # Very basic parser, can be expanded or use dateutil
                    for fmt in ['%d/%b/%Y', '%d/%m/%Y', '%b/%Y', '%Y-%m-%d']:
                         try:
                             parsed_date = datetime.strptime(val_str, fmt)
                             break
                         except:
                             pass
                
                if parsed_date:
                    date_map[c_idx] = parsed_date.strftime('%Y-%m-%d')
            except:
                continue

    if not date_map:
        return None # Fallback to simple list parser

    normalized_items = []
    
    # 2. Iterate Rows to extract values
    # We skip the header rows used for detection (loosely)
    start_row = 1 # Assume header is somewhere at top
    
    for r_idx in range(start_row, len(df)):
        row = df.iloc[r_idx]
        
        # For each known Date Column, look for a value
        for col_idx, date_str in date_map.items():
            try:
                val = row.iloc[col_idx]
                
                # Check if it's a number
                if pd.isna(val): continue
                
                # Cleanup number string if needed
                if isinstance(val, str):
                    val = val.replace('.', '').replace(',', '.')
                    if not val.replace('.', '', 1).isdigit(): continue # Not a number
                
                amount = float(val)
                if amount == 0: continue

                # 3. Find Label (Look Left)
                # Find the nearest non-empty text column to the left of this value column
                description = "Unknown"
                category = "General"
                
                for search_col in range(col_idx - 1, -1, -1):
                    candidate = row.iloc[search_col]
                    if pd.notna(candidate) and isinstance(candidate, str) and len(candidate.strip()) > 3:
                        description = candidate.strip()
                        # Simple heuristic for category based on indentation or bold (not avail here)
                        # We use the description itself as category for now or parent?
                        break
                
                # Add to result
                normalized_items.append({
                    "date": date_str,
                    "description": description,
                    "category": "Financial Statement", # Placeholder
                    "amount": amount
                })

            except Exception:
                continue

    return {
        "financial_period": datetime.now().year,
        "currency": "CLP",
        "items": normalized_items
    }

def normalize_dataframe(df: pd.DataFrame) -> dict:
    """
    Normalizes a generic DataFrame into the Canonical Financial Schema.
    Attempts Matrix Parsing first, then falls back to Simple List.
    """
    # Try Matrix Parsing first (for Balance Sheets/P&L with Date Headers)
    matrix_result = parse_financial_matrix(df)
    if matrix_result and len(matrix_result['items']) > 0:
        return matrix_result

    # 1. Clean Column Names
    df.columns = [str(c).lower().strip() for c in df.columns]
    
    # 2. Map Columns (Heuristic)
    # Goal: 'date', 'category', 'description', 'amount'
    column_map = {}
    
    for col in df.columns:
        if any(x in col for x in ['fecha', 'date']):
            column_map['date'] = col
        elif any(x in col for x in ['cat', 'rubro']):
            column_map['category'] = col
        elif any(x in col for x in ['desc', 'detalle', 'item']):
            column_map['description'] = col
        elif any(x in col for x in ['monto', 'valor', 'amount', 'neto']):
            column_map['amount'] = col

    # validation
    if 'amount' not in column_map:
        return {"error": "Could not identify Amount column"}
    
    normalized_items = []
    
    for _, row in df.iterrows():
        item = {}
        # Date
        if 'date' in column_map:
            try:
                date_val = pd.to_datetime(row[column_map['date']])
                item['date'] = date_val.strftime('%Y-%m-%d')
            except:
                item['date'] = datetime.now().strftime('%Y-%m-%d') # Fallback
        else:
             item['date'] = datetime.now().strftime('%Y-%m-%d') # Fallback

        # Description
        item['description'] = str(row[column_map['description']]) if 'description' in column_map else "Unknown"
        
        # Category
        item['category'] = str(row[column_map['category']]) if 'category' in column_map else "General"
        
        # Amount
        try:
            val = row[column_map['amount']]
            if isinstance(val, str):
                # Remove Chilean/European separators (1.000,00 -> 1000.00)
                # This is tricky without knowing exact locale, assuming standard int/float for now
                val = val.replace('.', '').replace(',', '.')
            item['amount'] = float(val)
        except:
             item['amount'] = 0.0
             
        normalized_items.append(item)

    return {
        "financial_period": datetime.now().year, # Placeholder detection
        "currency": "CLP",
        "items": normalized_items
    }

def main():
    parser = argparse.ArgumentParser(description='Parse Excel to Financial JSON')
    parser.add_argument('--input', required=True, help='Path to input Excel/CSV file')
    args = parser.parse_args()

    try:
        if args.input.endswith('.csv'):
            df = pd.read_csv(args.input)
        else:
            df = pd.read_excel(args.input)
        
        result = normalize_dataframe(df)
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
