import { calculateFinancialHealth } from "./financial-math";
import { FinancialStatement } from "./types";

// Helper to create mock data
const mockData: FinancialStatement = {
    metadata: { currency: "CLP" },
    pnl: {
        revenue: 1000,
        cogs: 600,
        grossProfit: 400,
        opEx: 200,
        operatingProfit: 200,
        otherIncome: 0,
        otherExpenses: 0,
        interestExpense: 50,
        taxes: 50,
        depreciation: 0,
        amortization: 0,
        netIncome: 100
    },
    balanceSheet: {
        currentAssets: 500,
        inventory: 200,
        accountsReceivable: 100,
        currentLiabilities: 300,
        totalAssets: 2000,
        totalLiabilities: 1000,
        accountsPayable: 100,
        equity: 1000
    }
};

// --- Test Cases ---

// 1. Current Ratio
// Assets: 500, Liab: 300 -> 1.66
// Expected: "Good"

// 2. Acid Test (Quick Ratio)
// (500 - 200) / 300 = 300 / 300 = 1.0
// Expected: "Good"

// 3. Solvency (Interest Coverage)
// EBIT: 200, Interest: 50 -> 4.0x
// Expected: "Good"

// 4. Profitability (Net Margin)
// Net: 100, Rev: 1000 -> 10%
// Expected: "Warning" (Between 5% and 15%)

const result = calculateFinancialHealth(mockData);

console.log("--- Financial Engine Test ---");
console.log("Current Ratio:", result.liquidity.currentRatio.value.toFixed(2), result.liquidity.currentRatio.status);
console.log("Acid Test:", result.liquidity.quickRatio.value.toFixed(2), result.liquidity.quickRatio.status);
console.log("Interest Cov:", result.solvency.interestCoverage.value.toFixed(2), result.solvency.interestCoverage.status);
console.log("Net Margin:", (result.profitability.netMargin.value * 100).toFixed(1) + "%", result.profitability.netMargin.status);
console.log("Overall Score:", result.overallScore);
