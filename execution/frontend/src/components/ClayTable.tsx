"use client";

import React, { useRef, useState, useEffect } from "react";
import { FinancialStatement } from "@/lib/types";
import { formatCLP } from "@/lib/formatters";
import { ChevronRight, ChevronDown, Info } from "lucide-react";

/**
 * START OF CLAY TABLE IMPLEMENTATION
 * 
 * Features:
 * 1. Sticky First Column ("Concepto")
 * 2. Sticky Header
 * 3. Horizontal Scroll for 100+ columns
 * 4. Hover Highlighting (Row + Col intersection ideally, but Row is MVP)
 * 5. Dense but legible typography
 */

interface ClayTableProps {
    statements: FinancialStatement[];
    title?: string;
}

// Helper to calculate variance safely
const calcVar = (curr: number, prev: number | undefined) => {
    if (!prev) return 0;
    return ((curr - prev) / Math.abs(prev)) * 100;
};

// Row Definition
interface RowDef {
    id: string;
    label: string;
    // Map to the nested path in statement object (e.g. "pnl.revenue")
    getValue: (s: FinancialStatement) => number;
    isTotal?: boolean;
    isNegative?: boolean; // If true, usually displayed red if negative, or handles sign logic
    indent?: number; // 0, 1, 2
}

const PNL_ROWS: RowDef[] = [
    { id: "rev", label: "Ingresos de Explotación", getValue: s => s.pnl.revenue, isTotal: true },
    { id: "cogs", label: "Costo de Ventas", getValue: s => -Math.abs(s.pnl.cogs), isNegative: true },
    { id: "gross", label: "Utilidad Bruta", getValue: s => s.pnl.grossProfit, isTotal: true },
    { id: "opex", label: "Gastos de Adm. y Ventas", getValue: s => -Math.abs(s.pnl.opEx), isNegative: true, indent: 1 },
    { id: "op_res", label: "Resultado Operacional", getValue: s => s.pnl.operatingProfit, isTotal: true },
    { id: "depr", label: "Depreciación y Amort.", getValue: s => -(s.pnl.depreciation + s.pnl.amortization), indent: 1 },
    { id: "ebitda", label: "EBITDA", getValue: s => s.pnl.ebitda || 0, isTotal: true },
    { id: "fin", label: "Resultado Financiero", getValue: s => -Math.abs(s.pnl.interestExpense), indent: 1 },
    { id: "tax", label: "Impuestos", getValue: s => -Math.abs(s.pnl.taxes), indent: 1 },
    { id: "net", label: "Utilidad Neta", getValue: s => s.pnl.netIncome, isTotal: true },
];

export function ClayTable({ statements, title }: ClayTableProps) {
    // Sort statements: Latest first for display priority
    const periods = [...statements].sort((a, b) => b.metadata.period.localeCompare(a.metadata.period));
    const latest = periods[0];
    const previous = periods.length > 1 ? periods[1] : null;

    // State for hover effect (optional enhancement)
    const [hoverRow, setHoverRow] = useState<string | null>(null);

    return (
        <div className="w-full h-full flex flex-col bg-[#0B0F17] rounded-xl border border-white/5 overflow-hidden shadow-xl">
            {/* Header */}
            {title && (
                <div className="px-6 py-4 border-b border-white/5 bg-[#0B0F17] flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">{title}</h3>
                    <div className="text-xs text-gray-500 font-mono">{periods.length} Periodos analizados</div>
                </div>
            )}

            {/* Scrollable Container */}
            <div className="flex-1 overflow-auto relative scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#0B0F17] z-20 sticky top-0">
                        <tr>
                            {/* Sticky First Column Header */}
                            <th className="sticky left-0 z-30 bg-[#0B0F17] p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-white/10 shadow-[4px_0_12px_rgba(0,0,0,0.5)] min-w-[200px] max-w-[300px]">
                                Concepto
                            </th>

                            {/* Dynamic Period Columns */}
                            {periods.map(stmt => (
                                <th key={stmt.metadata.period} className="p-3 text-xs font-semibold text-gray-400 font-mono text-right whitespace-nowrap border-b border-white/10 min-w-[120px]">
                                    {stmt.metadata.period}
                                </th>
                            ))}

                            {/* Variance Column (Sticky Right - Optional, currently just normal) */}
                            <th className="p-3 text-xs font-semibold text-gray-500 text-right whitespace-nowrap border-b border-white/10 min-w-[100px]">
                                Var % (YoY)
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {PNL_ROWS.map((row) => {
                            const currentVal = row.getValue(latest);
                            const prevVal = previous ? row.getValue(previous) : 0;
                            const variance = previous ? calcVar(currentVal, prevVal) : 0;
                            const isPositiveVar = variance > 0;

                            return (
                                <tr
                                    key={row.id}
                                    className="group hover:bg-white/5 transition-colors"
                                    onMouseEnter={() => setHoverRow(row.id)}
                                    onMouseLeave={() => setHoverRow(null)}
                                >
                                    {/* Sticky First Column Data */}
                                    <td className={`sticky left-0 z-10 p-3 text-sm border-r border-white/5 shadow-[4px_0_12px_rgba(0,0,0,0.5)] bg-[#0B0F17] group-hover:bg-[#151B26] transition-colors whitespace-nowrap ${row.isTotal ? 'font-bold text-white' : 'text-gray-400'}`}
                                        style={{ paddingLeft: row.indent ? `${row.indent * 20 + 12}px` : '12px' }}
                                    >
                                        <div className="flex items-center gap-2">
                                            {row.label}
                                            {row.id === 'ebitda' && <Info size={12} className="text-blue-500/50" />}
                                        </div>
                                    </td>

                                    {/* Data Columns */}
                                    {periods.map((stmt, idx) => {
                                        const val = row.getValue(stmt);
                                        return (
                                            <td key={idx} className={`p-3 text-right font-mono text-sm whitespace-nowrap ${row.isTotal ? 'text-gray-200' : 'text-gray-400'}`}>
                                                {formatCLP(val)}
                                            </td>
                                        );
                                    })}

                                    {/* Variance Column */}
                                    <td className={`p-3 text-right font-mono text-sm whitespace-nowrap font-medium ${isPositiveVar ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {previous ? (
                                            <span className="px-1.5 py-0.5 rounded bg-white/5">
                                                {variance > 0 ? '+' : ''}{variance.toFixed(1)}%
                                            </span>
                                        ) : '-'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Footer / Legend */}
            <div className="px-6 py-3 border-t border-white/5 bg-[#0B0F17] text-[10px] text-gray-600 flex justify-between">
                <span>* Valores en CLP. Variación calculada sobre periodo inmediato anterior.</span>
                <span>Antigravity Financial Engine v2.0</span>
            </div>
        </div>
    );
}
