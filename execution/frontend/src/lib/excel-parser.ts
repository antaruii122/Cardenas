
import * as XLSX from 'xlsx';
import { FinancialReport, FinancialStatement, ParsingResult, RawRow } from './types';
import { CATEGORY_MAPPINGS, PNL_MAPPINGS } from './mappings';

/**
 * Smart Excel Parser for Financial Statements
 * Features:
 * 1. Header Detection: Scans top rows to find Year/Date columns.
 * 2. Dynamic Columns: Maps date columns to separate Financial Statements.
 * 3. Format Agnostic: Detects if numbers use "." or "," for decimals.
 * 4. Multi-Period Aggregation: Builds multiple P&L statements simultaneously.
 */
export async function parseFinancialExcel(file: File): Promise<ParsingResult> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // 1. Get raw data as 2D array
        const grid: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

        // 2. Scan for Headers (Date/Year detection)
        const { headerRowIndex, periodMap } = detectHeaders(grid);

        if (headerRowIndex === -1 || periodMap.size === 0) {
            // Fallback: If no dates found, assume basic 2-column or 3-column layout (To be implemented if strictly needed, but Smart Mode is priority)
            // For now, let's try to infer at least 1 period from the last column if strictly no headers.
            return { success: false, errors: ["No se detectaron columnas de fechas (ej. 2024, 2025) en las primeras filas."], report: undefined };
        }

        // 3. Initialize Statements for each detected period
        const periodKeys = Array.from(periodMap.keys());
        const statements: Record<string, FinancialStatement> = {};

        periodKeys.forEach(period => {
            statements[period] = createEmptyStatement(period);
        });

        const rawRows: RawRow[] = [];
        const warnings: string[] = [];

        // 4. Iterate Rows (Start after header)
        for (let i = headerRowIndex + 1; i < grid.length; i++) {
            const row = grid[i];
            const firstCell = String(row[0] || "").trim();
            const secondCell = String(row[1] || "").trim();

            // Heuristic: Item Name is usually in Col 0 or Col 1.
            // If Col 0 is "Ingresos" (Category) and Col 1 is "Ventas" (Item)
            // Or Col 0 is "Ventas" (Item)

            // Let's assume simpler: Description is the longest text in first 2 cols.
            let description = firstCell;
            let category = "General"; // Can improve later

            // If first cell is empty but second has text, use second
            if (!firstCell && secondCell) description = secondCell;

            // CRITICAL FIX: Skip if description looks like a number (e.g. "0.214" from a percentage row)
            // This happens when the description column is empty and we pick up the value column by mistake.
            if (!description || description.length < 2 || !isNaN(parseFloat(description))) continue;

            // Skip lines that are explicitly percentage calculations/ratios (not raw data)
            if (description.includes("%") || description.toLowerCase().includes("porcentaje") || description.toLowerCase().includes("margin") || description.toLowerCase().includes("margen")) {
                // But be careful: "Margen de Explotación" might be a valid label for a row that HAS the monetary value too?
                // In the user's excel, "Margen de Explotación" (Row 6) has MONEY. "21.4%" (Row 7) has PERCENTAGE.
                // The "21.4%" row has NO description in Col A. So it was caught by the isNaN check above.
                // So we don't need to aggressively filter "Margen" keywords, just numeric descriptions.
            }


            const rowValues: Record<string, number> = {};
            let hasData = false;

            // Extract values for each period column
            periodMap.forEach((colIndex, period) => {
                const rawVal = row[colIndex];
                const cleanVal = cleanCurrencyValue(rawVal); // We need a robust cleaner
                rowValues[period] = cleanVal;

                // Add to Aggregation
                addToStatement(statements[period], description, cleanVal);

                if (cleanVal !== 0) hasData = true;
            });

            if (hasData) {
                rawRows.push({
                    rowNumber: i + 1,
                    category,
                    description,
                    values: rowValues
                });
            }
        }

        // 5. Post-Calculation (Calculated Fields like Gross Profit if not scraped)
        Object.values(statements).forEach(stmt => {
            calculateDerivedMetrics(stmt);
        });

        return {
            success: true,
            report: {
                statements: Object.values(statements), // Convert map to array
                insights: [],
                rawRows,
                warnings
            },
            errors: []
        };

    } catch (e: any) {
        return { success: false, errors: [e.message || "Error desconocido al procesar Excel."], report: undefined };
    }
}

// --- Helpers ---

function detectHeaders(grid: any[][]): { headerRowIndex: number, periodMap: Map<string, number> } {
    /**
     * BULLETPROOF HEADER DETECTION
     * Strategy:
     * 1. Scan first 10 rows for ANY cell containing a year (2020-2030) or date pattern
     * 2. Extract the year/date even if surrounded by other text (e.g., "31/Oct/2025 M$")
     * 3. If no dates found, fall back to detecting numeric columns
     */

    for (let r = 0; r < Math.min(grid.length, 10); r++) {
        const row = grid[r];
        const map = new Map<string, number>();
        let foundDate = false;

        row.forEach((cell: any, colIdx: number) => {
            if (colIdx < 1) return; // Skip first column (usually description)
            const valStr = String(cell || '').trim();
            if (!valStr) return;

            // Extract ANY 4-digit year (2020-2030)
            const yearMatch = valStr.match(/20[2-3][0-9]/);

            // Extract date patterns: 31/Oct/2025, 31-Oct-2025, 31/10/2025, etc.
            const dateMatch = valStr.match(/\d{1,2}[\\/\-](Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|[A-Za-z]{3}|\d{1,2})[\\/\-]\d{2,4}/i);

            // DETECT EXCEL SERIAL DATES (e.g. 45596 = 2024, 45961 = 2025)
            // Range 43831 (2020) to roughly 47696 (2030)
            const numVal = parseFloat(valStr);
            const isSerialDate = !isNaN(numVal) && numVal > 43000 && numVal < 48000;

            if (yearMatch || dateMatch || isSerialDate) {
                // Use the FULL cell value as the period key (e.g., "31/Oct/2025 M$")
                // But clean it slightly for display
                let periodKey = valStr.replace(/\s*M\$\s*/gi, '').trim() || valStr;

                if (isSerialDate) {
                    // Convert Serial to Date
                    // Excel base date is Dec 30 1899
                    const excelEpoch = new Date(1899, 11, 30);
                    const dateObj = new Date(excelEpoch.getTime() + numVal * 86400000);
                    // Format: DD/MM/YYYY
                    periodKey = dateObj.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" });
                }

                map.set(periodKey, colIdx);
                foundDate = true;
            }
        });

        if (foundDate && map.size > 0) {
            return { headerRowIndex: r, periodMap: map };
        }
    }

    // FALLBACK: If no dates found, detect numeric columns
    // This handles cases where headers are just "2024" or "2025" or even missing
    console.warn("No date headers found. Falling back to numeric column detection.");

    for (let r = 0; r < Math.min(grid.length, 10); r++) {
        const row = grid[r];
        const map = new Map<string, number>();

        row.forEach((cell: any, colIdx: number) => {
            if (colIdx < 1) return;

            // Check if this column has numeric data in the next few rows
            let hasNumericData = false;
            for (let checkRow = r + 1; checkRow < Math.min(r + 5, grid.length); checkRow++) {
                const checkCell = grid[checkRow]?.[colIdx];
                if (typeof checkCell === 'number' || (checkCell && !isNaN(parseFloat(String(checkCell).replace(/[^0-9.-]/g, ''))))) {
                    hasNumericData = true;
                    break;
                }
            }

            if (hasNumericData) {
                // Use column index as period name if no better name available
                const cellValue = String(cell || '').trim();
                const periodKey = cellValue || `Periodo_${colIdx}`;
                map.set(periodKey, colIdx);
            }
        });

        if (map.size > 0) {
            return { headerRowIndex: r, periodMap: map };
        }
    }

    return { headerRowIndex: -1, periodMap: new Map() };
}

function cleanCurrencyValue(val: any): number {
    if (typeof val === 'number') return val;
    if (!val) return 0;

    let str = String(val).trim();
    if (str === "-") return 0; // Accounting dash for zero

    // Handle (100) accounting negative
    const isNegativeParen = str.startsWith('(') && str.endsWith(')');
    if (isNegativeParen) str = str.replace(/[()]/g, '');

    // Heuristic for Decimals:
    // If contains "." and "," -> The last one is the decimal? 
    // CLP usually: 1.000.000 (dots for thousands, no decimals or comma for decimals).
    // Let's assume standard CLP: Remove dots, replace comma with dot.

    // Remove symbols ($)
    str = str.replace(/[^0-9.,-]/g, '');

    // Logic: 
    // 1.250,00 -> 1250.00
    // 1.250 -> 1250
    const dotCount = (str.match(/\./g) || []).length;
    const commaCount = (str.match(/,/g) || []).length;

    if (dotCount > 0 && commaCount > 0) {
        // Mixed. Usually last one is decimal.
        const lastDot = str.lastIndexOf('.');
        const lastComma = str.lastIndexOf(',');
        if (lastComma > lastDot) {
            // European/CLP: 1.000,00
            str = str.replace(/\./g, ''); // Remove thousands (dots)
            str = str.replace(',', '.'); // Comma to dot
        } else {
            // US: 1,000.00
            str = str.replace(/,/g, ''); // Remove thousands (commas)
        }
    } else if (dotCount > 0 && commaCount === 0) {
        // 1.000 -> Is it 1000 or 1.0? 
        // In CLP context, usually High numbers are integers. 
        // If it has 3 decimals (1.000) it's likely 1000. 
        // If it looks like Money, assume integer unless strict decimal context.
        // SAFE BET: Remove dots.
        str = str.replace(/\./g, '');
    } else if (commaCount > 0 && dotCount === 0) {
        // 1,000 -> US 1000? Or CLP 1,0?
        // Usually US format.
        str = str.replace(/,/g, '');
    }

    let num = parseFloat(str);
    if (isNegativeParen) num = -num;

    return isNaN(num) ? 0 : num;
}

function createEmptyStatement(period: string): FinancialStatement {
    return {
        metadata: { period, currency: "CLP" },
        pnl: {
            revenue: 0, cogs: 0, grossProfit: 0, opEx: 0, operatingProfit: 0,
            otherIncome: 0, otherExpenses: 0, interestExpense: 0, taxes: 0,
            depreciation: 0, amortization: 0, netIncome: 0
        },
        balanceSheet: {
            cash: 0, accountsReceivable: 0, inventory: 0, currentAssets: 0,
            fixedAssets: 0, totalAssets: 0, accountsPayable: 0, shortTermDebt: 0,
            currentLiabilities: 0, totalLiabilities: 0, longTermDebt: 0,
            shareholdersEquity: 0
        }
    };
}

function matches(text: string, aliases: string[]): boolean {
    if (!text || !aliases) return false;
    const lower = text.toLowerCase();
    return aliases.some(alias => lower.includes(alias));
}

function addToStatement(stmt: FinancialStatement, desc: string, val: number) {
    // Positive/Negative Logic: 
    // We want to store everything as "Absolute Magnitude" if it's a cost?? 
    // NO. Standard: Income (+), Expense (-)
    // BUT mapped expenses often come as positive numbers in Excel.
    // Logic: If mapped to Expense and Val > 0, flip to Negative? 
    // Let's keep extraction pure: Read what is there.
    // But P&L usually: Revenue (Pos), Cost (Neg). 
    // If User Excel has "Cost: 100", our System expects "Cost: -100" or handle it in display?
    // Let's standarize: Expenses Negative in Storage.

    // PRIORITY MATCHING: Check specific/calculated lines first to avoid "Revenue" catching "Other Income"

    // 1. Calculated Lines (Explicit overrides if found in Excel)
    if (matches(desc, PNL_MAPPINGS.grossProfit)) stmt.pnl.grossProfit = val;
    else if (matches(desc, PNL_MAPPINGS.operatingProfit)) stmt.pnl.operatingProfit = val;
    else if (matches(desc, PNL_MAPPINGS.netIncome)) stmt.pnl.netIncome = val;

    // 2. Specific Line Items (Priority over broad buckets)
    else if (matches(desc, PNL_MAPPINGS.otherIncome)) stmt.pnl.otherIncome += val;
    else if (matches(desc, PNL_MAPPINGS.taxes)) stmt.pnl.taxes += val > 0 ? -val : val; // Taxes usually negative

    // 3. Broad Buckets
    // "Revenue" captures "Ingresos" but must NOT capture "Otros Ingresos" (handled above)
    else if (matches(desc, PNL_MAPPINGS.revenue)) stmt.pnl.revenue += val;

    // COGS
    else if (matches(desc, PNL_MAPPINGS.cogs)) {
        // Usually costs are negative. If positive, flip it. If already negative, keep it.
        stmt.pnl.cogs += val > 0 ? -val : val;
    }

    // OpEx
    else if (matches(desc, PNL_MAPPINGS.opEx)) stmt.pnl.opEx += val > 0 ? -val : val;

    // Balance Sheet (Assets +, Liabs +, Equity +) -> Usually positive in BS
    // Using simple mapping based on keywords (Need new mappings in next step or use existing if robust)
    else if (matches(desc, ["activos corrientes", "activos circulantes"])) stmt.balanceSheet.currentAssets = val;
    else if (matches(desc, ["pasivos corrientes", "pasivos circulantes"])) stmt.balanceSheet.currentLiabilities = val;
    else if (matches(desc, ["patrimonio", "capital"])) stmt.balanceSheet.shareholdersEquity = val;
    else if (matches(desc, ["inventario", "existencias"])) stmt.balanceSheet.inventory = val;
    else if (matches(desc, ["cuentas por cobrar", "deudores"])) stmt.balanceSheet.accountsReceivable = val;

    // Capture UNMAPPED rows for AI Analysis
    else {
        if (!stmt.unmapped) stmt.unmapped = [];
        stmt.unmapped.push({ description: desc, value: val });
    }
}

function calculateDerivedMetrics(stmt: FinancialStatement) {
    const p = stmt.pnl;
    // Recalculate if totals are 0 but components exist
    if (p.grossProfit === 0 && p.revenue !== 0) p.grossProfit = p.revenue + p.cogs; // COGS is negative
    if (p.operatingProfit === 0 && p.grossProfit !== 0) p.operatingProfit = p.grossProfit + p.opEx; // OpEx is negative
    // ...
}
