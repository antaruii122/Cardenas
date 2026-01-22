import { FinancialStatement } from "./types";

// --- Types ---

export interface RatioResult {
    value: number;
    status: "Good" | "Warning" | "Critical" | "Neutral";
    score: number; // 0-100 normalized score for this specific metric
}

export interface FinancialHealthReport {
    liquidity: {
        currentRatio: RatioResult;
        quickRatio: RatioResult;
        score: number;
    };
    solvency: {
        debtToEquity: RatioResult; // D/E
        interestCoverage: RatioResult;
        score: number;
    };
    efficiency: {
        assetTurnover: RatioResult; // Revenue / Total Assets
        inventoryTurnover: RatioResult | null; // COGS / Inventory
        score: number;
    };
    profitability: {
        netMargin: RatioResult;
        grossMargin: RatioResult;
        roe: RatioResult; // Net Income / Equity
        score: number;
    };
    overallScore: number; // 0-100
}

// --- Helper: Status Classifiers ---

function classifyCurrentRatio(val: number): RatioResult["status"] {
    if (val >= 1.5) return "Good";
    if (val >= 1.0) return "Warning";
    return "Critical";
}

function classifyQuickRatio(val: number): RatioResult["status"] {
    if (val >= 1.0) return "Good";
    if (val >= 0.8) return "Warning";
    return "Critical";
}

function classifyDebtToEquity(val: number): RatioResult["status"] {
    // Lower is generally better, depend on industry. Assuming generic SME:
    if (val <= 1.0) return "Good";
    if (val <= 2.0) return "Warning";
    return "Critical";
}

function classifyInterestCoverage(val: number): RatioResult["status"] {
    if (val >= 3.0) return "Good";
    if (val >= 1.5) return "Warning";
    return "Critical";
}

function classifyNetMargin(val: number): RatioResult["status"] {
    if (val >= 0.15) return "Good"; // 15%
    if (val >= 0.05) return "Warning"; // 5%
    return "Critical";
}

// --- Main Calculation Engine ---

export function calculateFinancialHealth(data: FinancialStatement): FinancialHealthReport {
    const bs = data.balanceSheet;
    const pnl = data.pnl;

    // Default 0 for safety if Balance Sheet is missing (should be enforced upstream)
    const currentAssets = bs?.currentAssets || 0;
    const currentLiabilities = bs?.currentLiabilities || 1; // Avoid div by 0
    const inventory = bs?.inventory || 0;
    const totalAssets = bs?.totalAssets || 1;
    const totalLiabilities = bs?.totalLiabilities || 0;
    const equity = bs?.equity || 1; // Avoid div by 0

    const revenue = pnl.revenue || 1;
    const cogs = pnl.cogs;
    const ebit = pnl.operatingProfit;
    const interest = Math.abs(pnl.interestExpense);
    const netIncome = pnl.netIncome;

    // --- 1. LIQUIDITY ---
    const currentRatioVal = currentAssets / currentLiabilities;
    const quickRatioVal = (currentAssets - inventory) / currentLiabilities;

    const liquidityScore = Math.min(100, (quickRatioVal / 1.0) * 100); // 1.0 is the target for 100%

    const liquidity = {
        currentRatio: {
            value: currentRatioVal,
            status: classifyCurrentRatio(currentRatioVal),
            score: Math.min(100, (currentRatioVal / 1.5) * 100)
        },
        quickRatio: {
            value: quickRatioVal,
            status: classifyQuickRatio(quickRatioVal),
            score: Math.min(100, (quickRatioVal / 1.0) * 100)
        },
        score: Math.round(liquidityScore)
    };

    // --- 2. SOLVENCY ---
    const debtToEquityVal = totalLiabilities / equity;
    const interestCoverageVal = interest === 0 ? 10 : (ebit / interest); // Cap at 10

    const solvencyScoreRaw = (interestCoverageVal >= 3 ? 100 : (interestCoverageVal / 3) * 100);

    const solvency = {
        debtToEquity: {
            value: debtToEquityVal,
            status: classifyDebtToEquity(debtToEquityVal),
            score: Math.max(0, 100 - (debtToEquityVal * 30)) // Rough decay
        },
        interestCoverage: {
            value: interestCoverageVal,
            status: classifyInterestCoverage(interestCoverageVal),
            score: Math.min(100, solvencyScoreRaw)
        },
        score: Math.round(solvencyScoreRaw)
    };

    // --- 3. EFFICIENCY ---
    const assetTurnoverVal = revenue / totalAssets;
    const inventoryTurnoverVal = inventory > 0 ? cogs / inventory : null;

    const efficiency = {
        assetTurnover: {
            value: assetTurnoverVal,
            status: assetTurnoverVal > 1 ? "Good" : "Neutral" as any,
            score: Math.min(100, assetTurnoverVal * 100)
        },
        inventoryTurnover: inventoryTurnoverVal ? {
            value: inventoryTurnoverVal,
            status: "Neutral" as any, // Context dependent
            score: 50
        } : null,
        score: Math.min(100, assetTurnoverVal * 80) // Placeholder logic
    };

    // --- 4. PROFITABILITY ---
    const netMarginVal = netIncome / revenue;
    const grossMarginVal = pnl.grossProfit / revenue;
    const roeVal = netIncome / equity;

    const profitabilityScore = Math.min(100, (roeVal / 0.15) * 100); // Target 15% ROE

    const profitability = {
        netMargin: {
            value: netMarginVal,
            status: classifyNetMargin(netMarginVal),
            score: Math.min(100, (netMarginVal / 0.15) * 100)
        },
        grossMargin: {
            value: grossMarginVal,
            status: "Neutral" as any,
            score: 50
        },
        roe: {
            value: roeVal,
            status: roeVal > 0.15 ? "Good" : roeVal > 0.05 ? "Warning" : "Critical" as any,
            score: profitabilityScore
        },
        score: Math.round(profitabilityScore)
    };

    // --- OVERALL SCORE ---
    // Weighted Average: 30% Profit, 30% Solvency, 20% Liquidity, 20% Efficiency
    const overallScore = Math.round(
        (profitability.score * 0.3) +
        (solvency.score * 0.3) +
        (liquidity.score * 0.2) +
        (efficiency.score * 0.2)
    );

    return {
        liquidity,
        solvency,
        efficiency,
        profitability,
        overallScore
    };
}
