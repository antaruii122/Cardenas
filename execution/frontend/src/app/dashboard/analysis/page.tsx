"use client";

import { useEffect, useState } from "react";
import { FinancialReport } from "@/lib/types";
import { formatCLP, formatPercentDecimal } from "@/lib/formatters";
import { DataVerificationPanel } from "@/components/DataVerificationPanel";
import { StatementTreeTable } from "@/components/StatementTreeTable";
import { FinancialRadarChart } from "@/components/FinancialRadarChart";

import {
    ArrowUpRight, ArrowDownRight, DollarSign, Activity, PieChart, BarChart3,
    AlertCircle, Info, TrendingUp, TrendingDown
} from "lucide-react";

export default function AnalysisPage() {
    const [report, setReport] = useState<FinancialReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        const storedReport = localStorage.getItem("financialReport");
        if (storedReport) {
            setReport(JSON.parse(storedReport));
        }
        setLoading(false);
    }, []);

    if (loading) return <div className="flex h-[80vh] items-center justify-center text-neutral-400 animate-pulse">Cargando análisis experto...</div>;

    if (!report || !report.statements || report.statements.length === 0) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center gap-4 text-neutral-500">
                <AlertCircle size={40} className="text-neutral-300" />
                <p>No se encontraron datos financieros válidos.</p>
                <button
                    className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors text-sm font-medium"
                    onClick={() => window.location.href = '/dashboard'}
                >
                    Volver a Cargar Excel
                </button>
            </div>
        );
    }

    const sortedStatements = [...report.statements].sort((a, b) => a.metadata.period.localeCompare(b.metadata.period));
    const periods = sortedStatements.map(s => s.metadata.period);
    const current = sortedStatements[sortedStatements.length - 1];
    const previous = sortedStatements.length > 1 ? sortedStatements[sortedStatements.length - 2] : null;

    const calcVar = (curr: number, prev: number | undefined) => {
        if (!prev) return 0;
        return ((curr - prev) / Math.abs(prev)) * 100;
    };


    const margins = {
        gross: (current.pnl.grossProfit / current.pnl.revenue) * 100,
        op: (current.pnl.operatingProfit / current.pnl.revenue) * 100,
        net: (current.pnl.netIncome / current.pnl.revenue) * 100
    };

    const radarData = [
        { subject: 'Rentabilidad', A: Math.min(margins.op * 5, 100), fullMark: 100 },
        { subject: 'Liquidez', A: (current.balanceSheet.currentAssets / (current.balanceSheet.currentLiabilities || 1)) * 40 || 0, fullMark: 100 },
        { subject: 'Solvencia', A: 80, fullMark: 100 },
        { subject: 'Eficiencia', A: 65, fullMark: 100 },
        { subject: 'Crecimiento', A: 90, fullMark: 100 },
    const pnlRows = [
        { id: "rev", label: "Ingresos de Explotación", values: sortedStatements.map(s => s.pnl.revenue), isTotal: true },
        { id: "cogs", label: "Costo de Ventas", values: sortedStatements.map(s => -Math.abs(s.pnl.cogs)), isNegative: true },
        { id: "gross", label: "Utilidad Bruta", values: sortedStatements.map(s => s.pnl.grossProfit), isTotal: true },
        { id: "opex", label: "Gastos de Adm. y Ventas", values: sortedStatements.map(s => -Math.abs(s.pnl.opEx)), isNegative: true },
        { id: "op_res", label: "Resultado Operacional", values: sortedStatements.map(s => s.pnl.operatingProfit), isTotal: true },
        { id: "tax_int", label: "Intereses e Impuestos", values: sortedStatements.map(s => -(s.pnl.taxes + s.pnl.interestExpense)), isNegative: true },
        { id: "net", label: "Utilidad Neta", values: sortedStatements.map(s => s.pnl.netIncome), isTotal: true }
    ];

    const aiSummary = "La salud financiera muestra un fuerte crecimiento de Ingresos (+20%), pero la rentabilidad está bajo presión por el aumento de Costos (+25%). Se recomienda un enfoque agresivo en optimización de proveedores.";

    return (
        <div className="min-h-screen bg-[#0B0F17] text-gray-200 p-6 font-sans">
            <div className="max-w-[1600px] mx-auto space-y-6">

                {/* 0. Header (Minimalist) */}
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Activity className="text-blue-400" size={20} />
                        </div>
                        <h1 className="text-lg font-medium tracking-tight text-white">Antigravity Report: {current.metadata.period}</h1>
                    </div>
                    <div className="flex gap-4 items-center">
                        <span className="text-xs text-gray-500 uppercase tracking-widest">Moneda: {current.metadata.currency}</span>
                        <DataVerificationPanel report={report} />
                    </div>
                </div>

                {/* 1. AI Executive Summary (Brain) */}
                <div className="relative overflow-hidden rounded-2xl bg-[#151B26] border border-white/5 p-6 shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                    <div className="flex gap-6 items-start relative z-10">
                        <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl border border-white/10 shrink-0">
                            <TrendingUp className="text-indigo-400" size={32} />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-2">Resumen Ejecutivo AI</h3>
                            <p className="text-lg md:text-xl text-gray-100 font-light leading-relaxed max-w-4xl">
                                {aiSummary}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. The Bento Grid (3 Columns) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left: Key Financials (Table) */}
                    <div className="lg:col-span-4 bg-[#151B26] border border-white/5 rounded-2xl p-6 flex flex-col h-full">
                        <h3 className="text-white font-medium mb-6">Datos Financieros Clave</h3>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-gray-500 border-b border-white/5">
                                        <th className="text-left pb-3 font-medium">Concepto</th>
                                        <th className="text-right pb-3 font-medium">{current.metadata.period}</th>
                                        <th className="text-right pb-3 font-medium">Var %</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {pnlRows.map((row) => {
                                        const currVal = row.values[row.values.length - 1] || 0;
                                        const prevVal = row.values[row.values.length - 2] || 0;
                                        const variance = calcVar(currVal, prevVal);
                                        const isPos = variance > 0;

                                        return (
                                            <tr key={row.id} className="group hover:bg-white/5 transition-colors">
                                                <td className={`py-3 ${row.isTotal ? 'text-white font-medium' : 'text-gray-400'}`}>
                                                    {row.label}
                                                </td>
                                                <td className={`py-3 text-right font-mono tracking-tight ${row.isTotal ? 'text-white' : 'text-gray-300'}`}>
                                                    {formatCLP(currVal)}
                                                </td>
                                                <td className={`py-3 text-right font-medium ${isPos ? (row.isNegative ? 'text-rose-400' : 'text-emerald-400') : (row.isNegative ? 'text-emerald-400' : 'text-rose-400')}`}>
                                                    {isFinite(variance) ? `${variance > 0 ? '+' : ''}${variance.toFixed(1)}%` : '-'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Center: Performance Visuals (Charts) */}
                    <div className="lg:col-span-4 bg-[#151B26] border border-white/5 rounded-2xl p-6 flex flex-col h-full">
                        <h3 className="text-white font-medium mb-6">Tendencia de Rendimiento</h3>
                        <div className="flex-1 min-h-[300px] flex items-center justify-center border border-dashed border-white/10 rounded-xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] to-transparent opacity-50"></div>
                            <FinancialRadarChart data={radarData} />
                            {/* Hint: We can add more charts here in tabs later */}
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div className="bg-[#0B0F17] p-4 rounded-xl border border-white/5">
                                <span className="text-xs text-gray-500 uppercase">Margen Bruto</span>
                                <div className="text-xl font-mono text-white mt-1">{margins.gross.toFixed(1)}%</div>
                            </div>
                            <div className="bg-[#0B0F17] p-4 rounded-xl border border-white/5">
                                <span className="text-xs text-gray-500 uppercase">Margen Neto</span>
                                <div className="text-xl font-mono text-emerald-400 mt-1">{margins.net.toFixed(1)}%</div>
                            </div>
                        </div>
                    </div>

                    {/* Right: AI Insights (Action Items) */}
                    <div className="lg:col-span-4 bg-[#151B26] border border-white/5 rounded-2xl p-6 flex flex-col h-full">
                        <h3 className="text-white font-medium mb-6">Acciones Estratégicas (AI)</h3>

                        <div className="space-y-4">
                            {/* Action Item 1 */}
                            <div className="group p-4 bg-[#0B0F17] hover:bg-white/5 border border-white/5 hover:border-blue-500/30 rounded-xl transition-all cursor-pointer">
                                <div className="flex gap-3">
                                    <div className="mt-1 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-200 group-hover:text-blue-200">Renegociar Contratos Costos</h4>
                                        <p className="text-xs text-gray-500 mt-1">El COGS aumentó un 25%, superando el crecimiento de ingresos. Reducir costos directos es prioridad.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Item 2 */}
                            <div className="group p-4 bg-[#0B0F17] hover:bg-white/5 border border-white/5 hover:border-emerald-500/30 rounded-xl transition-all cursor-pointer">
                                <div className="flex gap-3">
                                    <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-200 group-hover:text-emerald-200">Optimizar Gastos Admin</h4>
                                        <p className="text-xs text-gray-500 mt-1">Gastos estables (+10%). Mantener control estricto para mejorar margen operativo.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Item 3 */}
                            <div className="group p-4 bg-[#0B0F17] hover:bg-white/5 border border-white/5 hover:border-purple-500/30 rounded-xl transition-all cursor-pointer">
                                <div className="flex gap-3">
                                    <div className="mt-1 w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-200 group-hover:text-purple-200">Revision de Precios</h4>
                                        <p className="text-xs text-gray-500 mt-1">Considerar ajuste de precios segun IPC para proteger el margen bruto.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-6">
                            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20 flex items-center justify-between">
                                <span className="text-xs font-medium text-blue-200">Ver Diagnóstico Completo</span>
                                <ArrowUpRight size={16} className="text-blue-300" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Detailed Breakdown (Tabs) */}
                <div className="mt-10">
                    <div className="flex gap-6 border-b border-white/5 mb-6">
                        <button
                            onClick={() => setActiveTab("overview")}
                            className={`pb-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'overview' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                        >
                            Estados Financieros
                        </button>
                        <button
                            onClick={() => setActiveTab("ratios")}
                            className={`pb-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'ratios' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                        >
                            Ratios Avanzados
                        </button>
                    </div>

                    <div className="bg-[#151B26] border border-white/5 rounded-2xl p-6 min-h-[400px]">
                        {activeTab === 'overview' && (
                            <StatementTreeTable
                                statements={report.statements}
                                title="Estado de Resultados Consolidado"
                            />
                        )}
                        {activeTab === 'ratios' && (
                            <div className="text-center text-gray-500 py-20">
                                <PieChart className="mx-auto mb-4 opacity-20" size={48} />
                                <p>Análisis de Ratios en desarrollo...</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

function SummaryCard({ label, subLabel, value, delta, icon, tooltip }: any) {
    const isPos = delta >= 0;

    return (
        <div className="group bg-white p-4 rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-300 relative">
            {/* Tooltip on Hover */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="relative group/tooltip">
                    <Info size={14} className="text-neutral-300 cursor-help" />
                    <div className="absolute right-0 w-48 bg-neutral-900 text-white text-[10px] p-2 rounded shadow-lg -mt-12 opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity z-50">
                        {tooltip}
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-start mb-2">
                <div>
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">{label}</span>
                    {subLabel && <span className="text-[10px] text-neutral-400 font-medium">{subLabel}</span>}
                </div>
                <div className={`p-2 rounded-lg ${isPos ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {icon}
                </div>
            </div>

            <div className="flex items-baseline gap-2 mt-1">
                <div className="text-2xl font-bold tracking-tight text-neutral-900">{value}</div>
            </div>

            {delta !== 0 && (
                <div className={`flex items-center gap-1 text-xs font-bold mt-2 ${isPos ? "text-emerald-600" : "text-rose-600"}`}>
                    {isPos ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span>{Math.abs(delta).toFixed(1)}%</span>
                    <span className="text-neutral-400 font-normal">vs periodo anterior</span>
                </div>
            )}
        </div>
    )
}

function TabTrigger({ active, onClick, children }: any) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${active
                ? "bg-neutral-900 text-white shadow-md ring-1 ring-black"
                : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                }`}
        >
            {children}
        </button>
    )
}
