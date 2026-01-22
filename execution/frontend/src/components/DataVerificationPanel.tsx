
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
        <div className="relative">
            {/* Header / Summary */}
            <button
                className={`flex items-center gap-3 px-4 py-2 rounded-lg border transition-all ${isOpen ? 'bg-[#151B26] border-white/10 text-white' : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5'}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {/* <CheckCircle size={16} className="text-emerald-500" /> */}
                <div className="flex flex-col items-end">
                    <span className="text-xs font-medium flex items-center gap-2">
                        {isOpen ? <ChevronUp size={14} /> : <FileSpreadsheet size={14} />}
                        Revisar Datos Source
                    </span>
                </div>
            </button>

            {/* Expanded Table (Absolute Dropdown or Modal feel) */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-[600px] max-h-[500px] overflow-y-auto bg-[#151B26] border border-white/10 rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b border-white/5 bg-[#151B26] sticky top-0">
                        <h4 className="text-sm font-medium text-white flex items-center gap-2">
                            <CheckCircle size={16} className="text-emerald-500" />
                            Datos Verificados Correctamente
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                            Mostrando {rowCount} filas detectadas en {periods.join(", ")}.
                        </p>
                    </div>
                    <table className="w-full text-xs text-left">
                        <thead className="bg-[#0B0F17] text-gray-500 font-medium sticky top-[69px]">
                            <tr>
                                <th className="px-4 py-2 w-12 text-center">#</th>
                                <th className="px-4 py-2">Descripción Detectada</th>
                                {periods.map(p => (
                                    <th key={p} className="px-4 py-2 text-right">{p}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {report.rawRows.map((row, idx) => (
                                <tr key={idx} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-2 text-gray-600 font-mono text-center">{row.rowNumber}</td>
                                    <td className="px-4 py-2 text-gray-300">{row.description}</td>
                                    {periods.map(p => (
                                        <td key={p} className="px-4 py-2 text-right font-mono text-gray-400">
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
