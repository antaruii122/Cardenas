// Core Financial Data Structure
export interface RawRow {
    category: string;
    description: string;
    amount: number;
    rowNumber: number;
}

export interface FinancialStatement {
    metadata: {
        companyName?: string;
        period?: string;
        currency: string;
    };
    pnl: {
        revenue: number;
        cogs: number;
        grossProfit: number;

        opEx: number;
        operatingProfit: number;

        otherIncome: number;
        otherExpenses: number;

        interestExpense: number;
        taxes: number;
        depreciation: number;
        amortization: number;

        netIncome: number;
        ebitda?: number; // Calculated
    };
    balanceSheet?: {
        currentAssets: number;
        currentLiabilities: number;
        inventory: number;
        accountsReceivable: number;
        accountsPayable: number;
        totalAssets: number;
        totalLiabilities: number;
        equity: number;
    };
}

export interface ParsingResult {
    success: boolean;
    data?: FinancialStatement;
    rawItems: RawRow[];
    errors: string[];
    warnings: string[];
}
