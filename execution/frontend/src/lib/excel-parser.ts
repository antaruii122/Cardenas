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

            const label = String(row[0] || "").toLowerCase().trim();
            const value = typeof row[1] === 'number' ? row[1] : parseFloat(String(row[1]).replace(/[^0-9.-]+/g, ""));

            if (isNaN(value)) return;

            // Simple Matcher
            if (matches(label, PNL_MAPPINGS.revenue)) statement.pnl.revenue = value;
            else if (matches(label, PNL_MAPPINGS.cogs)) statement.pnl.cogs = value;
            else if (matches(label, PNL_MAPPINGS.grossProfit)) statement.pnl.grossProfit = value;
            else if (matches(label, PNL_MAPPINGS.opEx)) statement.pnl.opEx = value;
            else if (matches(label, PNL_MAPPINGS.operatingProfit)) statement.pnl.operatingProfit = value;
            else if (matches(label, PNL_MAPPINGS.netIncome)) statement.pnl.netIncome = value;
        });

        // --- Validation Logic (Sanity Check) ---
        // 1. Gross Profit Check
        const calculatedGross = statement.pnl.revenue - statement.pnl.cogs;
        if (statement.pnl.grossProfit === 0 && calculatedGross !== 0) {
            statement.pnl.grossProfit = calculatedGross; // Auto-fill if missing
        } else if (Math.abs(statement.pnl.grossProfit - calculatedGross) > statement.pnl.revenue * 0.01) {
            warnings.push("Precaución: La Utilidad Bruta del Excel no coincide con (Ventas - Costos).");
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
