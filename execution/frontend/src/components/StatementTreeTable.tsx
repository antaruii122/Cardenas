"use client";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatCLP, formatPercentDecimal } from "@/lib/formatters";
import { FinancialStatement } from "@/lib/types";

interface Props {
    title: string;
    statements: FinancialStatement[];
}

export function StatementTreeTable({ title, statements }: Props) {
    // 1. Sort statements by period
    const sorted = [...statements].sort((a, b) => a.metadata.period.localeCompare(b.metadata.period));
    const periods = sorted.map(s => s.metadata.period);

    // 2. Define Rows
    const rows = [
        { id: "rev", label: "Ingresos de Explotación", values: sorted.map(s => s.pnl.revenue), isTotal: true },
        { id: "cogs", label: "Costo de Ventas", values: sorted.map(s => -Math.abs(s.pnl.cogs)), isNegative: true },
        { id: "gross", label: "Utilidad Bruta", values: sorted.map(s => s.pnl.grossProfit), isTotal: true, isBold: true },
        { id: "opex", label: "Gastos de Adm. y Ventas", values: sorted.map(s => -Math.abs(s.pnl.opEx)), isNegative: true },
        { id: "op_res", label: "Resultado Operacional", values: sorted.map(s => s.pnl.operatingProfit), isTotal: true, isBold: true },
        { id: "tax_int", label: "Intereses e Impuestos", values: sorted.map(s => -(s.pnl.taxes + s.pnl.interestExpense)), isNegative: true },
        { id: "net", label: "Utilidad Neta", values: sorted.map(s => s.pnl.netIncome), isTotal: true, isBold: true, isHighlight: true }
    ];

    return (
        <div className="w-full">
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
                <h3 className="font-medium text-white">{title}</h3>
                <span className="text-xs text-gray-500 uppercase tracking-widest">{statements.length} Periodos</span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-gray-500 border-b border-white/5">
                            <th className="px-6 py-3 text-left font-medium w-1/3">Concepto</th>
                            {periods.map((p) => (
                                <th key={p} className="px-6 py-3 text-right font-medium">{p}</th>
                            ))}
                            {periods.length >= 2 && (
                                <th className="px-6 py-3 text-right font-medium">Var %</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {rows.map(row => (
                            <TreeRow key={row.id} row={row} periods={periods} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function TreeRow({ row, periods }: { row: any, periods: string[] }) {
    // Only 2 period variance supported for simplified view
    let variance = null;
    if (periods.length >= 2) {
        const curr = row.values[row.values.length - 1];
        const prev = row.values[row.values.length - 2];
        if (prev !== 0) {
            variance = ((curr - prev) / Math.abs(prev)) * 100;
        }
    }

    return (
        <tr className={`group transition-colors border-white/5 hover:bg-white/5 ${row.isHighlight ? "bg-white/5" : ""}`}>
            <td className="px-6 py-3">
                <span className={`${row.isBold ? "text-white font-medium" : "text-gray-400"} ${row.isTotal ? "text-gray-200" : ""}`}>
                    {row.label}
                </span>
            </td>

            {row.values.map((val: number, idx: number) => (
                <td key={idx} className={`px-6 py-3 text-right font-mono tracking-tight ${row.isBold ? "text-white" : "text-gray-300"} ${row.isNegative ? "text-rose-400" : ""}`}>
                    {formatCLP(val)}
                </td>
            ))}

            {variance !== null && (
                <td className={`px-6 py-3 text-right font-medium ${variance > 0 ? (row.isNegative ? 'text-rose-400' : 'text-emerald-400') : (row.isNegative ? 'text-emerald-400' : 'text-rose-400')}`}>
                    {isFinite(variance) ? `${variance > 0 ? '+' : ''}${variance.toFixed(1)}%` : '-'}
                </td>
            )}
        </tr>
    )
}
