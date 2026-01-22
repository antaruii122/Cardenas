
"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatCLP, formatPercentDecimal } from "@/lib/formatters";

interface Props {
    title: string;
    // Data structure: Array of objects { label, values: [valYear1, valYear2], children?: [] }
    // But we need a simpler prop API.
    // Let's pass the "Year Columns" and the "Data Rows".
    periods: string[];
    rows: TreeRowData[];
}

export interface TreeRowData {
    id: string;
    label: string;
    values: number[]; // Matches periods index
    isTotal?: boolean; // Bold styling
    isNegative?: boolean; // Red text styling (e.g. costs)
    children?: TreeRowData[];
}

export function StatementTreeTable({ title, periods, rows }: Props) {
    return (
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
                <h3 className="font-semibold text-neutral-800">{title}</h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-neutral-500 border-b border-neutral-100">
                            <th className="px-6 py-3 text-left font-medium w-1/3">Concepto</th>
                            {periods.map((p, i) => (
                                <th key={p} className="px-6 py-3 text-right font-medium">
                                    {p}
                                    {/* Comparison Header Logic could go here */}
                                </th>
                            ))}
                            {periods.length === 2 && (
                                <th className="px-6 py-3 text-right font-medium">Var %</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50">
                        {rows.map(row => (
                            <TreeRow key={row.id} row={row} depth={0} periods={periods} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function TreeRow({ row, depth, periods }: { row: TreeRowData, depth: number, periods: string[] }) {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = row.children && row.children.length > 0;

    // Calc Variance for 2 periods
    let variance = null;
    if (periods.length === 2) {
        const v1 = row.values[1]; // Recent
        const v0 = row.values[0]; // Previous
        // Avoid div by zero
        if (v0 !== 0) {
            variance = ((v1 - v0) / Math.abs(v0)) * 100;
        }
    }

    return (
        <>
            <tr className={`group transition-colors ${row.isTotal ? "bg-neutral-50/80 font-semibold" : "hover:bg-neutral-50"}`}>
                <td className="px-6 py-3">
                    <div
                        className="flex items-center gap-2 cursor-pointer"
                        style={{ paddingLeft: `${depth * 20}px` }}
                        onClick={() => hasChildren && setExpanded(!expanded)}
                    >
                        {hasChildren ? (
                            expanded ? <ChevronDown size={14} className="text-neutral-400" /> : <ChevronRight size={14} className="text-neutral-400" />
                        ) : (
                            <div className="w-3.5" /> // Spacer
                        )}
                        <span className={`${row.isTotal ? "text-neutral-900" : "text-neutral-700"}`}>
                            {row.label}
                        </span>
                    </div>
                </td>

                {row.values.map((val, idx) => (
                    <td key={idx} className={`px-6 py-3 text-right font-mono ${row.isTotal ? "text-neutral-900" : "text-neutral-600"} ${row.isNegative ? "text-red-500" : ""}`}>
                        {formatCLP(val)}
                    </td>
                ))}

                {variance !== null && (
                    <td className="px-6 py-3 text-right">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${variance >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                            {variance > 0 ? "+" : ""}{formatPercentDecimal(variance)}
                        </span>
                    </td>
                )}
            </tr>

            {hasChildren && expanded && row.children!.map(child => (
                <TreeRow key={child.id} row={child} depth={depth + 1} periods={periods} />
            ))}
        </>
    )
}
