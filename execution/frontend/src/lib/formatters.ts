
/**
 * Formats a number as Chilean Pesos (CLP).
 * Style: $ 1.000.000 (standard) or $ 1.000 (if small).
 * No decimals usually for CLP unless specifically requested.
 */
export function formatCLP(amount: number): string {
    if (amount === undefined || amount === null) return "-";

    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

export function formatPercent(value: number): string {
    if (value === undefined || value === null) return "-";
    return new Intl.NumberFormat('es-CL', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    }).format(value / 100); // Input assume 10.5 for 10.5%? No, usually 0.105. Let's assume input is 0-100 based on previous code usually x100.
    // Wait, previous code: (profit / revenue) * 100. So input is 30.5.
    // Intl expects 0.305.
    // Let's adjust based on usage. Let's assume input is 0-100.
}

export function formatPercentDecimal(value: number): string {
    // Value 30.5 -> "30,5%"
    return value.toLocaleString('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';
}
