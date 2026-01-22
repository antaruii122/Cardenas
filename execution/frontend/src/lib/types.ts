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
        totalAssets: number;
        currentAssets: number;
        cash: number; // For Cash Ratio
        accountsReceivable: number; // For DSO
        inventory: number; // For Inventory Turnover
        fixedAssets: number;

        totalLiabilities: number;
        currentLiabilities: number;
        accountsPayable: number; // For DPO
        shortTermDebt: number;
        longTermDebt: number;

        shareholdersEquity: number;
        retainedEarnings?: number;
    };
    ratios: {
        // Liquidity
        currentRatio: number | null;
        quickRatio: number | null;
        cashRatio: number | null;
        workingCapital: number | null;

        // Efficiency
        assetTurnover: number | null;
        inventoryTurnover: number | null;
        daysInventoryOutstanding: number | null; // DIO
        receivablesTurnover: number | null;
        daysSalesOutstanding: number | null; // DSO
        payablesTurnover: number | null;
        daysPayablesOutstanding: number | null; // DPO
        cashConversionCycle: number | null; // CCC

        // Profitability
        grossMargin: number | null;
        operatingMargin: number | null;
        ebitdaMargin: number | null;
        netMargin: number | null;
        roa: number | null;
        roe: number | null;

        // Solvency
        debtToEquity: number | null;
        debtRatio: number | null;
        interestCoverage: number | null;
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

