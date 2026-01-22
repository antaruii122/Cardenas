// Core Financial Data Structure
export interface RawRow {
    category: string;
    description: string;
    // Map period headers (keys) to values (numbers)
    // e.g. { "2024": 1000, "2025": 1200 }
    values: Record<string, number>;
    rowNumber: number;
}

export interface FinancialStatement {
    metadata: {
        companyName?: string;
        period: string; // "2024", "2025", "Q1-2024"
        currency: string;
    };
    pnl: {
        revenue: number;
        cogs: number;
        grossProfit: number;

        opEx: number; // General Expenses
        operatingProfit: number;

        // Granular OpEx (Optional)
        adminExpenses?: number;
        salesExpenses?: number;

        otherIncome: number;
        otherExpenses: number;

        interestExpense: number;
        taxes: number;
        depreciation: number;
        amortization: number;

        netIncome: number;
        ebitda?: number; // Calculated
    };
    balanceSheet: {
        // Assets
        cash: number;
        accountsReceivable: number;
        inventory: number;
        currentAssets: number;
        fixedAssets: number; // P.P.y E.
        totalAssets: number;

        // Liabilities
        accountsPayable: number;
        shortTermDebt: number;
        currentLiabilities: number;
        longTermDebt: number;
        totalLiabilities: number;

        // Equity
        shareholdersEquity: number;
        retainedEarnings?: number;
    };
    ratios?: {
        grossMargin: number;
        operatingMargin: number; // EBIT Margin
        netMargin: number;
        ebitdaMargin?: number;

        currentRatio: number; // Liquidity
        quickRatio: number;   // Acid Test
        cashRatio: number;

        roe?: number;
        roa?: number;
        debtToEquity?: number;
    };
    unmapped?: Array<{ description: string; value: number }>; // For AI Analysis
}

export interface FinancialReport {
    statements: FinancialStatement[]; // Multiple periods (Year 1, Year 2...)
    insights: string[];
    rawRows: RawRow[];
    warnings: string[];
}

export interface ParsingResult {
    success: boolean;
    report?: FinancialReport;
    errors: string[];
}

