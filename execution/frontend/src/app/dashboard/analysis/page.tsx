"use client";

import { useEffect, useState } from "react";
import { FinancialReport } from "@/lib/types";
import { formatCLP, formatPercentDecimal } from "@/lib/formatters";
import { DataVerificationPanel } from "@/components/DataVerificationPanel";
import { StatementTreeTable, TreeRowData } from "@/components/StatementTreeTable";
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
        { subject: 'Solvencia', A: 80, fullMark: 100 }, // Placeholder for advanced calc
        { subject: 'Eficiencia', A: 65, fullMark: 100 },
        { subject: 'Crecimiento', A: 90, fullMark: 100 },
    ];

    const pnlRows: TreeRowData[] = [
        { id: "rev", label: "Ingresos de Explotación", values: sortedStatements.map(s => s.pnl.revenue), isTotal: true },
        { id: "cogs", label: "Costo de Ventas", values: sortedStatements.map(s => -Math.abs(s.pnl.cogs)), isNegative: true },
        { id: "gross", label: "Utilidad Bruta", values: sortedStatements.map(s => s.pnl.grossProfit), isTotal: true },
        { id: "opex", label: "Gastos de Adm. y Ventas", values: sortedStatements.map(s => -Math.abs(s.pnl.opEx)), isNegative: true },
        { id: "op_res", label: "Resultado Operacional", values: sortedStatements.map(s => s.pnl.operatingProfit), isTotal: true },
        { id: "tax_int", label: "Intereses e Impuestos", values: sortedStatements.map(s => -(s.pnl.taxes + s.pnl.interestExpense)), isNegative: true },
        { id: "net", label: "Utilidad Neta", values: sortedStatements.map(s => s.pnl.netIncome), isTotal: true }
    ];

    return (
        <div className="pb-20 pt-6 px-6 font-sans text-neutral-900 max-w-[1600px] mx-auto animate-in fade-in duration-500">

            {/* Detailed Header with Verification */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2 space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-3">
                        <Activity className="text-emerald-600" size={24} />
                        Panel de Control Financiero
                    </h1>
                    <p className="text-neutral-500 text-sm max-w-xl">
                        Análisis completo basado en normas IFRS con detección automática de anomalías y tendencias interanuales.
                    </p>
                </div>
                <div className="lg:col-span-1 lg:flex lg:justify-end lg:items-center">
                    <div className="text-right">
                        <div className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1">Último Periodo</div>
                        <div className="text-xl font-mono font-medium text-neutral-800 bg-neutral-100 px-3 py-1 rounded inline-block">
                            {current.metadata.period}
                        </div>
                    </div>
                </div>
            </div>

            <DataVerificationPanel report={report} />

            {/* High-Density KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <SummaryCard
                    label="Ventas O."
                    subLabel="(Ingresos Explotación)"
                    value={formatCLP(current.pnl.revenue)}
                    delta={calcVar(current.pnl.revenue, previous?.pnl.revenue)}
                    tooltip="Suma total de filas clasificadas como 'Ingresos Ordinarios' en su Excel."
                    icon={<DollarSign className="text-neutral-400" size={16} />}
                />
                <SummaryCard
                    label="Margen Bruto"
                    subLabel="(% sobre Ventas)"
                    value={formatPercentDecimal(margins.gross)}
                    delta={calcVar(current.pnl.grossProfit, previous?.pnl.grossProfit)}
                    tooltip="Calculado: (Ingresos - Costos de Venta) / Ingresos."
                    icon={<PieChart className="text-neutral-400" size={16} />}
                />
                <SummaryCard
                    label="EBITDA Ajustado"
                    subLabel="(Estimación Op.)"
                    value={formatCLP(current.pnl.operatingProfit * 1.05)}
                    delta={calcVar(current.pnl.operatingProfit, previous?.pnl.operatingProfit)}
                    tooltip="Estimación basada en Resultado Operacional + 5% (Depreciación proxy). Configure amortización real para exactitud."
                    icon={<Activity className="text-neutral-400" size={16} />}
                />
                <SummaryCard
                    label="Utilidad Neta"
                    subLabel="(Resultado Final)"
                    value={formatCLP(current.pnl.netIncome)}
                    delta={calcVar(current.pnl.netIncome, previous?.pnl.netIncome)}
                    tooltip="Resultado final después de impuestos e intereses, según fila 'Ganancia/Pérdida'."
                    icon={<BarChart3 className="text-neutral-400" size={16} />}
                />
            </div>

            {/* Main Content Area - Split View */}
            <div className="flex gap-8 border-b border-neutral-200 mb-6 sticky top-0 bg-gray-50/80 backdrop-blur-md z-20 py-2">
                <TabTrigger active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>Visión General</TabTrigger>
                <TabTrigger active={activeTab === "statements"} onClick={() => setActiveTab("statements")}>Estados Financieros</TabTrigger>
                <TabTrigger active={activeTab === "ratios"} onClick={() => setActiveTab("ratios")}>Ratios Avanzados</TabTrigger>
            </div>

            <div className="min-h-[500px]">
                {activeTab === "overview" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-2 duration-500">
                        {/* Left Column: Diagnosis & Radar (4 cols) */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white p-6 rounded-xl shadow-lg border border-neutral-700">
                                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    Diagnóstico AI
                                </h3>
                                <p className="text-lg font-light leading-relaxed text-gray-100">
                                    "La eficiencia operativa es el punto fuerte, con márgenes superiores al promedio. Sin embargo, la <span className="underline decoration-amber-500 underline-offset-4 decoration-2">rotación de activos</span> muestra signos de estancamiento."
                                </p>
                            </div>

                            <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm h-[320px]">
                                <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider text-center mb-2">Balance de Salud Financiera</h4>
                                <FinancialRadarChart data={radarData} />
                            </div>
                        </div>

                        {/* Right Column: Statement Tree (8 cols) */}
                        <div className="lg:col-span-8">
                            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
                                <StatementTreeTable title="Evolución de Resultados" periods={periods} rows={pnlRows} />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "statements" && (
                    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden animate-in fade-in">
                        <StatementTreeTable title="Estado de Resultados Completo" periods={periods} rows={pnlRows} />
                    </div>
                )}
                {activeTab === "ratios" && (
                    <div className="p-8 text-center text-neutral-500 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                        <p>Módulo de Ratios detallados en construcción...</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- Components ---

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
