"use client";

import { useEffect, useState } from "react";
import { FinancialReport } from "@/lib/types";
import { formatCLP, formatPercentDecimal } from "@/lib/formatters";
import { DataVerificationPanel } from "@/components/DataVerificationPanel";
import { StatementTreeTable } from "@/components/StatementTreeTable";

import {
    ArrowUpRight, ArrowDownRight, DollarSign, Activity, PieChart, BarChart3,
    AlertCircle, Info, TrendingUp, TrendingDown
} from "lucide-react";

export default function AnalysisPage() {
    const [report, setReport] = useState<FinancialReport | null>(null);
    const [loading, setLoading] = useState(true);

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

    // Sort statements: earliest (left) to latest (right) or vice-versa? 
    // Usually P&L columns are Latest -> Earliest (Left -> Right) or Earliest -> Latest.
    // The user wants to see "3 years".
    // Let's sort Ascending (2023, 2024, 2025) so it's chronological, OR Descending (2025, 2024, 2023) to see latest first?
    // Standard financial reporting is usually Descending (Latest, Prev, Prev).
    const sortedStatements = [...report.statements].sort((a, b) => b.metadata.period.localeCompare(a.metadata.period)); // Descending

    const periods = sortedStatements.map(s => s.metadata.period);
    const current = sortedStatements[0]; // Latest
    const previous = sortedStatements.length > 1 ? sortedStatements[1] : null;

    const calcVar = (curr: number, prev: number | undefined) => {
        if (!prev) return 0;
        return ((curr - prev) / Math.abs(prev)) * 100;
    };

    const hasBalanceSheet = current.balanceSheet.totalAssets > 0 || current.balanceSheet.currentAssets > 0;

    // --- Dynamic AI Summary ---
    const revenueVar = calcVar(current.pnl.revenue, previous?.pnl.revenue);
    const costVar = calcVar(Math.abs(current.pnl.cogs), Math.abs(previous?.pnl.cogs || 0));
    const netMargin = current.ratios?.netMargin || 0;

    let summaryText = `La salud financiera muestra ${revenueVar >= 0 ? 'un crecimiento' : 'una contracción'} de Ingresos del ${Math.abs(revenueVar).toFixed(1)}%. `;
    if (costVar > revenueVar) {
        summaryText += `Sin embargo, los costos aumentaron a un ritmo mayor (${costVar.toFixed(1)}%), presionando los márgenes. `;
    } else {
        summaryText += `La gestión de costos se mantuvo eficiente (+${costVar.toFixed(1)}%), permitiendo una expansión de márgenes. `;
    }
    summaryText += `El margen neto actual es del ${netMargin.toFixed(1)}%.`;
    if (!hasBalanceSheet) {
        summaryText += " (Nota: Análisis limitado al Estado de Resultados por falta de datos de Balance General).";
    }

    // --- Dynamic Ratios Logic ---
    const ratioData = hasBalanceSheet ? [
        {
            label: "Márgen EBITDA",
            value: current.ratios?.ebitdaMargin,
            format: "%",
            ideal: "> 15%",
            color: "text-blue-400",
            math: `(${formatCLP(current.pnl.ebitda || 0)} / ${formatCLP(current.pnl.revenue)})`
        },
        {
            label: "Prueba Ácida",
            value: current.ratios?.quickRatio,
            format: "x",
            ideal: "> 1.0x",
            color: "text-emerald-400",
            math: `((${formatCLP(current.balanceSheet.currentAssets)} - ${formatCLP(current.balanceSheet.inventory)}) / ${formatCLP(current.balanceSheet.currentLiabilities)})`
        },
        {
            label: "Liquidez Cte.",
            value: current.ratios?.currentRatio,
            format: "x",
            ideal: "1.5 - 2.0x",
            color: "text-teal-400",
            math: `(${formatCLP(current.balanceSheet.currentAssets)} / ${formatCLP(current.balanceSheet.currentLiabilities)})`
        },
        {
            label: "ROA",
            value: current.ratios?.roa,
            format: "%",
            ideal: "> 5%",
            color: "text-purple-400",
            math: `(${formatCLP(current.pnl.netIncome)} / ${formatCLP(current.balanceSheet.totalAssets)})`
        },
    ] : [
        {
            label: "Márgen EBITDA",
            value: current.ratios?.ebitdaMargin,
            format: "%",
            ideal: "> 15%",
            color: "text-blue-400",
            math: `(${formatCLP(current.pnl.ebitda || 0)} / ${formatCLP(current.pnl.revenue)})`
        },
        {
            label: "Márgen Operativo",
            value: current.ratios?.operatingMargin,
            format: "%",
            ideal: "> 10%",
            color: "text-emerald-400",
            math: `(${formatCLP(current.pnl.operatingProfit)} / ${formatCLP(current.pnl.revenue)})`
        },
        {
            label: "Impacto Impuestos",
            value: (current.pnl.taxes / current.pnl.revenue) * 100,
            format: "%",
            ideal: "< 27%",
            color: "text-rose-400",
            math: `(${formatCLP(current.pnl.taxes)} / ${formatCLP(current.pnl.revenue)})`
        },
        {
            label: "Carga Financiera",
            value: (current.pnl.interestExpense / current.pnl.revenue) * 100,
            format: "%",
            ideal: "< 5%",
            color: "text-amber-400",
            math: `(${formatCLP(current.pnl.interestExpense)} / ${formatCLP(current.pnl.revenue)})`
        },
    ];

    // --- Dynamic Action Items ---
    const actions = [];
    // 1. COGS Action
    if (costVar > revenueVar) {
        actions.push({
            title: "Renegociar Costos Directos",
            desc: `Costos crecen más rápido que ventas (+${costVar.toFixed(1)}% vs +${revenueVar.toFixed(1)}%). Urge revisión de proveedores.`,
            color: "rose"
        });
    } else {
        actions.push({
            title: "Potenciar Inversión",
            desc: `Margen bruto saludable. Buen momento para reinvertir en crecimiento.`,
            color: "emerald"
        });
    }
    // 2. OpEx Action
    const opexVar = calcVar(Math.abs(current.pnl.opEx), Math.abs(previous?.pnl.opEx || 0));
    if (opexVar > 10) {
        actions.push({
            title: "Control de Gastos Admin",
            desc: `Gastos fijos aumentaron considerablemente (+${opexVar.toFixed(1)}%). Revisar nómina y servicios.`,
            color: "amber"
        });
    } else {
        actions.push({
            title: "Eficiencia Operativa",
            desc: `Gastos bajo control. Mantener estructura liviana.`,
            color: "blue"
        });
    }
    // 3. Balance Sheet Action
    if (hasBalanceSheet) {
        if ((current.ratios?.quickRatio || 0) < 1) {
            actions.push({
                title: "Mejorar Liquidez Inmediata",
                desc: "Prueba ácida < 1. Considerar factoraje o renegociar plazos de pago.",
                color: "purple"
            });
        }
    } else {
        actions.push({
            title: "Cargar Balance General",
            desc: "Para métricas de liquidez y solvencia, por favor cargue los datos del Balance.",
            color: "gray"
        });
    }
    const displayActions = actions.slice(0, 3);

    const pnlRows = [
        { id: "rev", label: "Ingresos de Explotación", values: sortedStatements.map(s => s.pnl.revenue), isTotal: true },
        { id: "cogs", label: "Costo de Ventas", values: sortedStatements.map(s => -Math.abs(s.pnl.cogs)), isNegative: true },
        { id: "gross", label: "Utilidad Bruta", values: sortedStatements.map(s => s.pnl.grossProfit), isTotal: true },
        { id: "opex", label: "Gastos de Adm. y Ventas", values: sortedStatements.map(s => -Math.abs(s.pnl.opEx)), isNegative: true },
        { id: "op_res", label: "Resultado Operacional", values: sortedStatements.map(s => s.pnl.operatingProfit), isTotal: true },
        { id: "tax_int", label: "Intereses e Impuestos", values: sortedStatements.map(s => -(s.pnl.taxes + s.pnl.interestExpense)), isNegative: true },
        { id: "net", label: "Utilidad Neta", values: sortedStatements.map(s => s.pnl.netIncome), isTotal: true }
    ];

    return (
        <div className="min-h-screen bg-[#0B0F17] text-gray-200 p-6 font-sans">
            <div className="max-w-[1600px] mx-auto space-y-6">

                {/* Header */}
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

                {/* AI Executive Summary */}
                <div className="relative overflow-hidden rounded-2xl bg-[#151B26] border border-white/5 p-6 shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                    <div className="flex gap-6 items-start relative z-10">
                        <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl border border-white/10 shrink-0">
                            <TrendingUp className="text-indigo-400" size={32} />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-2">Resumen Ejecutivo AI (Dinámico)</h3>
                            <p className="text-lg md:text-xl text-gray-100 font-light leading-relaxed max-w-4xl">
                                {summaryText}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bento Grid layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left: Key Financials */}
                    <div className="lg:col-span-4 bg-[#151B26] border border-white/5 rounded-2xl p-6 flex flex-col h-full">
                        <h3 className="text-white font-medium mb-6">Datos Financieros Clave</h3>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-gray-500 border-b border-white/5">
                                        <th className="text-left pb-3 font-medium">Concepto</th>
                                        {periods.map(p => (
                                            <th key={p} className="text-right pb-3 font-medium">{p}</th>
                                        ))}
                                        <th className="text-right pb-3 font-medium">Var %</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {pnlRows.map((row) => {
                                        const currVal = row.values[0] || 0; // Latest is index 0
                                        const prevVal = row.values[1] || 0;
                                        const variance = calcVar(currVal, prevVal);
                                        const isPos = variance > 0;
                                        return (
                                            <tr key={row.id} className="group hover:bg-white/5 transition-colors cursor-help" title={`Valor calculado desde filas fuente`}>
                                                <td className={`py-3 ${row.isTotal ? 'text-white font-medium' : 'text-gray-400'}`}>
                                                    {row.label}
                                                </td>
                                                {row.values.map((v, i) => (
                                                    <td key={i} className={`py-3 text-right font-mono tracking-tight ${row.isTotal ? 'text-white' : 'text-gray-300'}`}>
                                                        {formatCLP(v)}
                                                    </td>
                                                ))}
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

                    {/* Center: Strategic Ratios (The NEW Focus) */}
                    <div className="lg:col-span-4 bg-[#151B26] border border-white/5 rounded-2xl p-6 flex flex-col h-full">
                        <h3 className="text-white font-medium mb-6">Ratios Estratégicos</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {ratioData.map((r, i) => (
                                <div key={i} className="p-4 bg-[#0B0F17] border border-white/5 rounded-xl hover:border-white/20 transition-all cursor-help relative group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">{r.label}</span>
                                            <div className={`text-2xl font-mono ${r.color}`}>
                                                {r.value ? r.value.toFixed(1) : '-'}
                                                <span className="text-sm text-gray-500 ml-1">{r.format === '%' ? '%' : 'x'}</span>
                                            </div>
                                        </div>
                                        {r.value !== undefined && (
                                            <div className="p-2 rounded-lg bg-white/5 text-gray-400 text-[10px] font-mono">
                                                Meta: {r.ideal}
                                            </div>
                                        )}
                                    </div>
                                    {/* Calculated Math Tooltip */}
                                    <div className="absolute opacity-0 group-hover:opacity-100 bottom-full left-0 mb-2 bg-gray-900 border border-white/10 text-xs text-gray-300 p-3 rounded-lg shadow-xl pointer-events-none transition-opacity w-64 z-50">
                                        <div className="font-semibold text-white mb-1">Cálculo:</div>
                                        <div className="font-mono text-[10px] leading-tight break-words">
                                            {r.math}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
                            <h4 className="text-xs font-semibold text-blue-400 uppercase mb-2">Diagnóstico Rápido</h4>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                {hasBalanceSheet
                                    ? (current.ratios?.quickRatio && current.ratios.quickRatio < 1
                                        ? "Alerta: La Prueba Ácida es menor a 1.0, indicando posibles problemas de liquidez."
                                        : "Liquidez saludable. La compañía cubre sus deudas corto plazo.")
                                    : "Precaución: No se detectaron datos de Balance General. Análisis restringido a rentabilidad operativa."
                                }
                            </p>
                        </div>
                    </div>

                    {/* Right: AI Insights (Action Items) */}
                    <div className="lg:col-span-4 bg-[#151B26] border border-white/5 rounded-2xl p-6 flex flex-col h-full">
                        <h3 className="text-white font-medium mb-6">Acciones Estratégicas (AI)</h3>

                        <div className="space-y-4">
                            {displayActions.map((action, idx) => (
                                <div key={idx} className="group p-4 bg-[#0B0F17] hover:bg-white/5 border border-white/5 hover:border-blue-500/30 rounded-xl transition-all cursor-pointer">
                                    <div className="flex gap-3">
                                        <div className={`mt-1 w-2 h-2 rounded-full shadow-[0_0_8px] bg-${action.color}-500 shadow-${action.color}-500/50`} />
                                        <div>
                                            <h4 className={`text-sm font-medium text-gray-200 group-hover:text-${action.color}-200`}>{action.title}</h4>
                                            <p className="text-xs text-gray-500 mt-1">{action.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto pt-6">
                            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20 flex items-center justify-between">
                                <span className="text-xs font-medium text-blue-200">Ver Diagnóstico Completo</span>
                                <ArrowUpRight size={16} className="text-blue-300" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Table */}
                <div className="mt-10">
                    <StatementTreeTable statements={report.statements} title="Estado de Resultados Consolidado" />
                </div>
            </div>
        </div>
    );
}
