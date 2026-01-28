import pandas as pd
import sys
import json
import argparse
from datetime import datetime

def normalize_dataframe(df: pd.DataFrame) -> dict:
    """
    Normalizes a generic DataFrame into the Canonical Financial Schema.
    """
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
