import json
import argparse
import sys

def calculate_kpis(financial_period: str, items: list) -> dict:
    """
    Calculates Financial KPIs based on Chilean standards.
    Categorization logic is simplified for the tool.
    In production, this might use an LLM or stricter classifier.
    """
    
    # 1. Aggregations
    total_sales = 0.0
    cost_of_sales = 0.0
    fixed_costs = 0.0
    current_assets = 0.0
    current_liabilities = 0.0
    
    for item in items:
        cat = item.get('category', '').lower()
        amt = float(item.get('amount', 0.0))
        
        # Simple heuristic mapping
        if 'ingreso' in cat or 'venta' in cat:
            total_sales += amt
        elif 'costo' in cat:
            cost_of_sales += abs(amt)
        elif 'gasto' in cat or 'admin' in cat:
            fixed_costs += abs(amt)
        # Assets/Liabilities usually come from Balance Sheet, not P&L
        # We will assume some placeholders if available, or skip
            
    # 2. KPI Formulas
    gross_margin = 0.0
    if total_sales > 0:
        gross_margin = (total_sales - cost_of_sales) / total_sales
        
    net_income = total_sales - cost_of_sales - fixed_costs

    return {
        "period": financial_period,
        "total_sales": total_sales,
        "cost_of_sales": cost_of_sales,
        "fixed_costs": fixed_costs,
        "net_income": net_income,
        "ratios": {
            "gross_margin_pct": round(gross_margin * 100, 2),
            "net_margin_pct": round((net_income / total_sales * 100) if total_sales else 0, 2)
        }
    }

def generate_optimization_rules(kpis: dict) -> list:
    """
    Generates 'Mejoramientos' based on calculated KPIs.
    """
    rules = []
    
    # Rule: High Fixed Costs
    sales = kpis.get('total_sales', 0)
    fixed = kpis.get('fixed_costs', 0)
    
    if sales > 0 and (fixed / sales) > 0.5:
        rules.append({
            "rule_id": "HIGH_FIXED_COSTS",
            "severity": "HIGH",
            "title": "Gastos Fijos Elevados",
            "message": f"Tus gastos fijos ({fixed}) representan más del 50% de tus ventas.",
            "actionable_step": "Audita tus suscripciones y re-negocia el arriendo."
        })
        
    # Rule: Low Margin
    margin = kpis.get('ratios', {}).get('gross_margin_pct', 0)
    if margin < 30:
         rules.append({
            "rule_id": "LOW_GROSS_MARGIN",
            "severity": "MEDIUM",
            "title": "Margen Bruto Bajo",
            "message": f"Tu margen bruto es del {margin}%.",
            "actionable_step": "Revisa tus costos de venta o precios."
        })

    return rules

def analyze(input_data: dict) -> dict:
    
    period = input_data.get('financial_period', 'Unknown')
    items = input_data.get('items', [])
    
    kpis = calculate_kpis(period, items)
    improvements = generate_optimization_rules(kpis)
    
    return {
        "kpis": kpis,
        "improvements": improvements
    }

def main():
    parser = argparse.ArgumentParser(description='Analyze Financial Data')
    parser.add_argument('--input', required=True, help='Path to normalized JSON input')
    args = parser.parse_args()

    try:
        with open(args.input, 'r') as f:
            data = json.load(f)
            
        result = analyze(data)
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
