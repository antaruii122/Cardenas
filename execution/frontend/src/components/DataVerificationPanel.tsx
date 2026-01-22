
"use client";

import { useState } from "react";
import { FinancialReport } from "@/lib/types";
import { ChevronDown, ChevronUp, CheckCircle, AlertTriangle, FileSpreadsheet } from "lucide-react";
import { formatCLP } from "@/lib/formatters";

interface Props {
    report: FinancialReport;
}

export function DataVerificationPanel({ report }: Props) {
    const [isOpen, setIsOpen] = useState(false);

    const periods = report.statements.map(s => s.metadata.period);
    const rowCount = report.rawRows.length;

    return (
        <div className="border border-neutral-200 bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            {/* Header / Summary */}
            <div
                className="p-4 flex items-center justify-between cursor-pointer bg-neutral-50 hover:bg-neutral-100 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                        <CheckCircle size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-neutral-900">Datos Verificados Correctamente</h3>
                        <p className="text-xs text-neutral-500">
                            Detectamos <span className="font-medium text-neutral-800">{periods.length} periodos ({periods.join(", ")})</span> y {rowCount} filas de datos.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-neutral-600">
                    <FileSpreadsheet size={16} />
                    <span>Revisar Datos Fuente</span>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
            </div>

            {/* Expanded Table */}
            {isOpen && (
                <div className="border-t border-neutral-200 p-0 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-neutral-50 text-neutral-500 font-medium">
                            <tr>
                                <th className="px-4 py-2 w-16">#</th>
                                <th className="px-4 py-2">Descripción Detectada</th>
                                {periods.map(p => (
                                    <th key={p} className="px-4 py-2 text-right">{p}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {report.rawRows.map((row, idx) => (
                                <tr key={idx} className="hover:bg-neutral-50/50 transition-colors">
                                    <td className="px-4 py-2 text-neutral-400 font-mono text-xs">{row.rowNumber}</td>
                                    <td className="px-4 py-2 text-neutral-800">{row.description}</td>
                                    {periods.map(p => (
                                        <td key={p} className="px-4 py-2 text-right font-mono text-neutral-600">
                                            {formatCLP(row.values[p] || 0)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
