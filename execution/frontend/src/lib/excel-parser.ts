import * as XLSX from 'xlsx';
import { FinancialStatement, ParsingResult } from './types';
import { PNL_MAPPINGS } from './mappings';

/**
 * Main function to parse uploaded Excel file
 */
export async function parseFinancialExcel(file: File): Promise<ParsingResult> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        // Assume first sheet is the one
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert to array of arrays
        const jsonData: (string | number)[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const statement: FinancialStatement = {
            metadata: { currency: "CLP" },
            pnl: {
                revenue: 0, cogs: 0, grossProfit: 0, opEx: 0, operatingProfit: 0,
                otherIncome: 0, otherExpenses: 0, interestExpense: 0, taxes: 0,
                depreciation: 0, amortization: 0, netIncome: 0
            }
        };

        const warnings: string[] = [];

        // --- Extraction Logic ---
        jsonData.forEach((row, index) => {
            if (row.length < 2) return;

            // Strategy: Detect Column 2 (Index 2) vs Column 1 (Index 1) for Value
            // User Format: [Category, Item, Amount] -> Use Index 1 (Label) and Index 2 (Value)
            // Standard Format: [Item, Amount] -> Use Index 0 (Label) and Index 1 (Value)

            let labelRaw = "";
            let valueRaw: any = 0;

            const col2 = row[2]; // Potential Value in 3-col layout
            const col1 = row[1]; // Potential Value in 2-col layout or Label in 3-col

            // Check if 3rd column looks like a number/currency
            const isCol2Numeric = isNumeric(col2);

            if (row.length >= 3 && isCol2Numeric) {
                // assume 3-column layout
                labelRaw = String(col1 || "");
                valueRaw = col2;
            } else {
                // assume 2-column layout
                labelRaw = String(row[0] || "");
                valueRaw = col1;
            }

            const label = labelRaw.toLowerCase().trim();
            const value = cleanValue(valueRaw);

            if (isNaN(value)) return;

            // Simple Matcher
            if (matches(label, PNL_MAPPINGS.revenue)) statement.pnl.revenue += value;
            else if (matches(label, PNL_MAPPINGS.cogs)) statement.pnl.cogs += value; // Accumulate in case of multiple rows
            else if (matches(label, PNL_MAPPINGS.grossProfit)) statement.pnl.grossProfit = value; // Usually a subtotal line
            else if (matches(label, PNL_MAPPINGS.opEx)) statement.pnl.opEx += value;
            else if (matches(label, PNL_MAPPINGS.operatingProfit)) statement.pnl.operatingProfit = value;
            else if (matches(label, PNL_MAPPINGS.netIncome)) statement.pnl.netIncome = value;
        });

        // --- Validation Logic (Sanity Check) ---
        // 1. Gross Profit Check
        const calculatedGross = statement.pnl.revenue - statement.pnl.cogs;
        // If we accumulated COGS as positive numbers (common in some excels), but formula expects subtraction
        // We need to be smart. Usually COGS are expenses.
        // Let's ensure COGS is positive magnitude for the math: Gross = Rev - COGS
        // But if user put negative numbers for COGS, we should handle that.

        // Normalize COGS to be positive magnitude for calculation if it was read as negative
        // actually standard P&L math: Revenue (pos) - COGS (pos) = Gross. 
        // If Excel had negative numbers for COGS, 'statement.pnl.cogs' is negative.
        // Let's assume absolute values for the check logic to be safe or blindly trust the math?
        // Better: Trust the math but warn.

        if (statement.pnl.grossProfit === 0 && calculatedGross !== 0) {
            statement.pnl.grossProfit = calculatedGross; // Auto-fill if missing
        }

        // 2. Critical Fields Check
        if (statement.pnl.revenue === 0) warnings.push("No se encontró 'Ingresos de Explotación' o similar.");
        if (statement.pnl.netIncome === 0) warnings.push("No se encontró 'Utilidad Neta' o similar.");

        return {
            success: warnings.length === 0 || statement.pnl.revenue > 0, // Success if we at least found revenue
            data: statement,
            errors: [],
            warnings
        };

    } catch (error) {
        return {
            success: false,
            errors: [(error as Error).message],
            warnings: []
        };
    }
}

// Helper to check fuzzy match
function matches(label: string, validAliases: string[]): boolean {
    return validAliases.some(alias => label.includes(alias) || alias.includes(label));
}

function cleanValue(val: any): number {
    if (typeof val === 'number') return val;
    if (!val) return 0;

    let str = String(val).trim();

    // Check for Accounting format: (100) -> -100
    const isNegative = str.startsWith('(') && str.endsWith(')');

    // Remove all non-numeric chars except minus and dot (and maybe comma if European)
    // Assuming CLP format often uses dots for thousands. 
    // We want to remove dots, keep numeric, allow minus.

    // Remove "parentheses" if accounting
    if (isNegative) {
        str = str.replace(/[()]/g, '');
    }

    // Remove currency symbols and dots (thousands separators in CLP)
    // Be careful with decimals. CLP usually doesn't have cents in these reports, but if it does usually comma.
    // Safety: Remove everything that is NOT 0-9, -, or , (if decimal)
    // Actually, simple regex: remove anything that isn't a digit or a minus sign.
    // If there is a decimal comma, replace it with dot?
    // Let's assume standard "CLP $10.000.000" -> remove '$' and '.'

    str = str.replace(/[^0-9,-]/g, ''); // Keep digits, comma, minus
    str = str.replace(',', '.'); // Convert decimal comma to dot

    let num = parseFloat(str);

    if (isNegative) num = -num;

    return isNaN(num) ? 0 : num;
}

function isNumeric(val: any): boolean {
    if (typeof val === 'number') return true;
    if (!val) return false;
    // Check if cleaning it results in a valid number that isn't 0 (unless it's literally 0)
    // Heuristic: Does it have digits?
    return /[0-9]/.test(String(val));
}
