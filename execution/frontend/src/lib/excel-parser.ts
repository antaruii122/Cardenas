import * as XLSX from 'xlsx';
import { FinancialStatement, ParsingResult, RawRow } from './types';
import { PNL_MAPPINGS, CATEGORY_MAPPINGS } from './mappings';

/**
 * Main function to parse uploaded Excel file
 * REFACTORED: Now captures ALL rows and uses Category Column (A) for aggregation
 */
export async function parseFinancialExcel(file: File): Promise<ParsingResult> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Get raw data
        const jsonData: (string | number)[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Initialize State
        const statement: FinancialStatement = {
            metadata: { currency: "CLP" },
            pnl: {
                revenue: 0, cogs: 0, grossProfit: 0, opEx: 0, operatingProfit: 0,
                otherIncome: 0, otherExpenses: 0, interestExpense: 0, taxes: 0,
                depreciation: 0, amortization: 0, netIncome: 0
            }
        };

        const rawItems: RawRow[] = [];
        const warnings: string[] = [];
        let rowCount = 0;

        // --- Iteration Logic ---
        jsonData.forEach((row, index) => {
            // Skip empty rows or header rows (simple heuristic: needs at least 2 cols)
            if (row.length < 2) return;

            // Normalize Columns
            // Column 0: Category (e.g. "Ingresos", "Gastos Oper.")
            // Column 1: Item Name (e.g. "Ventas", "Sueldos")
            // Column 2: Amount (or invalid)

            const rawCol0 = String(row[0] || "").trim();
            const rawCol1 = String(row[1] || "").trim();
            const rawCol2 = row[2];

            // 1. Determine Layout (2-col vs 3-col)
            // If col2 is numeric, it's likely [Category, Item, Value]
            // If not, it might be [Item, Value] (Old user format)

            let category = "";
            let description = "";
            let amountRaw: any = 0;
            let isThreeCol = false;

            if (isNumeric(rawCol2)) {
                // 3-Column Layout
                category = rawCol0;
                description = rawCol1;
                amountRaw = rawCol2;
                isThreeCol = true;
            } else if (isNumeric(rawCol1)) {
                // 2-Column Layout (fallback)
                category = "General"; // No category info
                description = rawCol0;
                amountRaw = rawCol1;
            } else {
                return; // Skip non-data row
            }

            const amount = cleanValue(amountRaw);
            if (isNaN(amount) || amount === 0) return; // Skip zero rows if preferred, or keep them. Let's skip strict 0s

            // 2. Store Raw Data (For DataGrid)
            rawItems.push({
                rowNumber: index + 1,
                category,
                description,
                amount
            });
            rowCount++;

            // 3. Smart Aggregation (The "Brain")
            const catLower = category.toLowerCase();
            const descLower = description.toLowerCase();

            let matched = false;

            // Priority A: Category Mapping (Aggregates unknown items into correct bucket)
            if (matches(catLower, CATEGORY_MAPPINGS.revenue)) {
                statement.pnl.revenue += amount;
                matched = true;
            } else if (matches(catLower, CATEGORY_MAPPINGS.cogs)) {
                statement.pnl.cogs += Math.abs(amount); // COGS usually expenses
                matched = true;
            } else if (matches(catLower, CATEGORY_MAPPINGS.opEx)) {
                statement.pnl.opEx += Math.abs(amount); // Expenses are positive in P&L structure usually (Revenue - Exp)
                matched = true;
            }

            // Priority B: Specific Item Mapping (Overwrites or handles specifics like Start/End lines)
            // Specific overrides generic. E.g. "Utilidad Bruta" line is not added, just recorded.

            if (matches(descLower, PNL_MAPPINGS.grossProfit)) {
                statement.pnl.grossProfit = amount;
                // Don't mark as 'matched' for addition if it's a subtotal line we just captured
                // Actually, if we are building bottom up, we calculate Gross ourselves.
                // But capturing the Read value is good for sanity check.
            }
            else if (matches(descLower, PNL_MAPPINGS.operatingProfit)) statement.pnl.operatingProfit = amount;
            else if (matches(descLower, PNL_MAPPINGS.netIncome)) statement.pnl.netIncome = amount;
            else if (matches(descLower, PNL_MAPPINGS.taxes)) statement.pnl.taxes += Math.abs(amount);

            // Priority C: Fallback for 2-column or unknown categories using Descriptions
            if (!matched && !isThreeCol) {
                if (matches(descLower, PNL_MAPPINGS.revenue)) statement.pnl.revenue += amount;
                else if (matches(descLower, PNL_MAPPINGS.cogs)) statement.pnl.cogs += Math.abs(amount);
                else if (matches(descLower, PNL_MAPPINGS.opEx)) statement.pnl.opEx += Math.abs(amount);
            }
        });

        // --- Post-Calculation & Validation ---

        // If we summed up components, let's recalculate totals to be sure
        const calcGross = statement.pnl.revenue - statement.pnl.cogs;
        const calcOp = calcGross - statement.pnl.opEx;

        // Auto-fill if missing (e.g. didn't find "Margen Bruto" line)
        if (statement.pnl.grossProfit === 0) statement.pnl.grossProfit = calcGross;
        if (statement.pnl.operatingProfit === 0) statement.pnl.operatingProfit = calcOp;

        // Warnings
        if (statement.pnl.revenue === 0) warnings.push("No pudimos detectar Ingresos.");
        if (statement.pnl.netIncome === 0) {
            // Fallback: If we have OpProfit but no Net Income line, maybe Net = OpProfit - Tax?
            // statement.pnl.netIncome = statement.pnl.operatingProfit - statement.pnl.taxes;
            warnings.push("No se encontró 'Utilidad Neta'.");
        }

        return {
            success: rowCount > 0,
            data: statement,
            rawItems,
            errors: [],
            warnings
        };

    } catch (error) {
        return {
            success: false,
            data: undefined,
            rawItems: [],
            errors: [(error as Error).message],
            warnings: []
        };
    }
}

// --- Helpers ---

function matches(text: string, aliases: string[]): boolean {
    if (!aliases) return false;
    return aliases.some(alias => text.includes(alias) || alias.includes(text));
}

function cleanValue(val: any): number {
    if (typeof val === 'number') return val;
    if (!val) return 0;

    let str = String(val).trim();
    // Accounting format usually: (123) for negative
    const isNegative = str.startsWith('(') && str.endsWith(')');

    if (isNegative) str = str.replace(/[()]/g, '');

    // Remove all non-digits/dots/commas/minus
    // Handle "$ 1.200.000" (CLP) -> 1200000
    // Handle "1,200.00" (USD sometimes) -> Logic below assumes CLP standard

    str = str.replace(/[^0-9,-]/g, '');
    str = str.replace(',', '.'); // Comma to dot

    let num = parseFloat(str);
    if (isNegative) num = -num;

    return isNaN(num) ? 0 : num;
}

function isNumeric(val: any): boolean {
    if (typeof val === 'number') return true;
    if (!val) return false;
    // Must contain digits
    return /[0-9]/.test(String(val));
}
