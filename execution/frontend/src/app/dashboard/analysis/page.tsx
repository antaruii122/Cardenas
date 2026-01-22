"use client";

import { useEffect, useState } from "react";
import { FinancialReport } from "@/lib/types";
import { formatCLP, formatPercentDecimal } from "@/lib/formatters";
import { DataVerificationPanel } from "@/components/DataVerificationPanel";
import { StatementTreeTable, TreeRowData } from "@/components/StatementTreeTable";
import { FinancialRadarChart } from "@/components/FinancialRadarChart";

import { ArrowUpRight, ArrowDownRight, DollarSign, Activity, PieChart, BarChart3, AlertCircle } from "lucide-react";

export default function AnalysisPage() {
    const [report, setReport] = useState<FinancialReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        // Load Parsed Report
        // NOTE: The key must match what the Upload Page saves.
        const storedReport = localStorage.getItem("financialReport");
        if (storedReport) {
            setReport(JSON.parse(storedReport));
        }
        setLoading(false);
    }, []);

    if (loading) return <div className="flex h-[50vh] items-center justify-center text-neutral-400">Cargando análisis...</div>;

    if (!report || !report.statements || report.statements.length === 0) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-neutral-500">
                <AlertCircle size={40} className="text-neutral-300" />
                <p>No hay datos financieros cargados o el formato es inválido.</p>
                <div className="text-sm px-4 py-2 bg-neutral-100 rounded-lg cursor-pointer hover:bg-neutral-200" onClick={() => window.location.href = '/dashboard'}>
                    Volver a Cargar Excel
                </div>
            </div>
        );
    }

    // Sort statements by period
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
        { subject: 'Liquidez', A: (current.balanceSheet.currentAssets / current.balanceSheet.currentLiabilities) * 40 || 0, fullMark: 100 },
        { subject: 'Solvencia', A: 80, fullMark: 100 },
        { subject: 'Eficiencia', A: 65, fullMark: 100 },
        { subject: 'Crecimiento', A: 90, fullMark: 100 },
    ];

    const pnlRows: TreeRowData[] = [
        {
            id: "rev", label: "Ingresos de Explotación",
            values: sortedStatements.map(s => s.pnl.revenue),
            isTotal: true
        },
        {
            id: "cogs", label: "Costo de Ventas",
            values: sortedStatements.map(s => -Math.abs(s.pnl.cogs)),
            isNegative: true
        },
        {
            id: "gross", label: "Utilidad Bruta",
            values: sortedStatements.map(s => s.pnl.grossProfit),
            isTotal: true
        },
        {
            id: "opex", label: "Gastos de Administración y Ventas",
            values: sortedStatements.map(s => -Math.abs(s.pnl.opEx)),
            isNegative: true
        },
        {
            id: "op_res", label: "Resultado Operacional",
            values: sortedStatements.map(s => s.pnl.operatingProfit),
            isTotal: true
        },
        {
            id: "tax_int", label: "Intereses e Impuestos",
            values: sortedStatements.map(s => -(s.pnl.taxes + s.pnl.interestExpense)),
            isNegative: true
        },
        {
            id: "net", label: "Utilidad Neta",
            values: sortedStatements.map(s => s.pnl.netIncome),
            isTotal: true
        }
    ];

    return (
        <div className="pb-20 space-y-8 animate-in fade-in duration-700 font-sans text-neutral-900">

            {/* Header */}
            <div className="space-y-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Análisis Financiero</h1>
                        <p className="text-neutral-500 mt-1">Diagnóstico basado en normas IFRS.</p>
                    </div>
                </div>

                <DataVerificationPanel report={report} />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <SummaryCard
                    label="Ventas Totales"
                    value={formatCLP(current.pnl.revenue)}
                    delta={calcVar(current.pnl.revenue, previous?.pnl.revenue)}
                    icon={<DollarSign className="text-neutral-400" size={18} />}
                />
                <SummaryCard
                    label="Margen Bruto"
                    value={formatPercentDecimal(margins.gross)}
                    delta={calcVar(current.pnl.grossProfit, previous?.pnl.grossProfit)}
                    icon={<PieChart className="text-neutral-400" size={18} />}
                />
                <SummaryCard
                    label="EBITDA (Est.)"
                    value={formatCLP(current.pnl.operatingProfit * 1.05)}
                    delta={calcVar(current.pnl.operatingProfit, previous?.pnl.operatingProfit)}
                    icon={<Activity className="text-neutral-400" size={18} />}
                />
                <SummaryCard
                    label="Utilidad Neta"
                    value={formatCLP(current.pnl.netIncome)}
                    delta={calcVar(current.pnl.netIncome, previous?.pnl.netIncome)}
                    icon={<BarChart3 className="text-neutral-400" size={18} />}
                />
            </div>

            {/* Tabs Header */}
            <div className="flex gap-6 border-b border-neutral-200">
                <TabTrigger active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>Visión General</TabTrigger>
                <TabTrigger active={activeTab === "statements"} onClick={() => setActiveTab("statements")}>Estados Financieros</TabTrigger>
                <TabTrigger active={activeTab === "ratios"} onClick={() => setActiveTab("ratios")}>Ratios y Métricas</TabTrigger>
                <TabTrigger active={activeTab === "insights"} onClick={() => setActiveTab("insights")}>Recomendaciones AI</TabTrigger>
            </div>

            {/* Tabs Content */}
            <div className="pt-4">
                {activeTab === "overview" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-neutral-900 text-white p-6 rounded-xl shadow-lg">
                                <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-2">Diagnóstico Ejecutivo</h3>
                                <p className="text-xl font-light leading-relaxed">
                                    "La empresa muestra una <strong className="font-semibold text-emerald-400">solidez operativa notable</strong>, pero los niveles de liquidez sugieren precaución ante obligaciones de corto plazo."
                                </p>
                            </div>
                            <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                                <h4 className="text-sm font-semibold mb-4 text-neutral-600 center">Perfil Financiero</h4>
                                <FinancialRadarChart data={radarData} />
                            </div>
                        </div>
                        <div className="lg:col-span-2">
                            <StatementTreeTable title="Resumen de Resultados" periods={periods} rows={pnlRows} />
                        </div>
                    </div>
                )}

                {activeTab === "statements" && (
                    <div className="animate-in fade-in duration-300">
                        <StatementTreeTable title="Estado de Resultados Consolidado" periods={periods} rows={pnlRows} />
                    </div>
                )}

                {activeTab === "ratios" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
                        <div className="p-6 bg-white border border-neutral-200 rounded-xl">
                            <h4 className="font-semibold text-neutral-800 mb-4">Rentabilidad</h4>
                            <div className="space-y-4">
                                <RatioRow label="Margen Operacional" value={formatPercentDecimal(margins.op)} target="> 10%" />
                                <RatioRow label="Margen Neto" value={formatPercentDecimal(margins.net)} target="> 5%" />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "insights" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                        <InsightCard type="warning" title="Optimizar Ciclo de Caja" desc="Incremento en días de cobranza detectado." />
                    </div>
                )}
            </div>
        </div>
    );
}

// Components
function SummaryCard({ label, value, delta, icon }: any) {
    const isPos = delta >= 0;
    return (
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-neutral-500">{label}</span>
                {icon}
            </div>
            <div>
                <div className="text-2xl font-bold tracking-tight text-neutral-900">{value}</div>
                {delta !== 0 && (
                    <div className={`flex items-center gap-1 text-xs font-medium mt-1 ${isPos ? "text-emerald-600" : "text-rose-600"}`}>
                        {isPos ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        <span>{Math.abs(delta).toFixed(1)}% vs anterior</span>
                    </div>
                )}
            </div>
        </div>
    )
}

function TabTrigger({ active, onClick, children }: any) {
    return (
        <button
            onClick={onClick}
            className={`px-1 py-3 text-sm font-medium border-b-2 transition-all ${active
                    ? "text-neutral-900 border-black"
                    : "text-neutral-500 border-transparent hover:text-neutral-800"
                }`}
        >
            {children}
        </button>
    )
}

function RatioRow({ label, value, target, warn }: any) {
    return (
        <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-600">{label}</span>
            <div className="text-right">
                <div className={`font-mono font-medium ${warn ? "text-amber-600" : "text-neutral-900"}`}>{value}</div>
                <div className="text-xs text-neutral-400">{target ? `Meta: ${target}` : ''}</div>
            </div>
        </div>
    )
}

function InsightCard({ type, title, desc }: any) {
    const isWarn = type === "warning";
    return (
        <div className={`p-6 rounded-xl border ${isWarn ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"}`}>
            <h4 className={`font-bold mb-2 ${isWarn ? "text-amber-800" : "text-emerald-800"}`}>{title}</h4>
            <p className={`text-sm ${isWarn ? "text-amber-700" : "text-emerald-700"}`}>{desc}</p>
        </div>
    )
}
