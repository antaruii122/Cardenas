"use client";

import { useEffect, useState } from "react";
import { FinancialStatement } from "@/lib/types";
import { ArrowUpRight, ArrowDownRight, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";

import { useRouter } from "next/navigation";
import { FinancialCharts } from "@/components/FinancialCharts";
import { DataGrid } from "@/components/DataGrid";
import { Table as TableIcon } from "lucide-react";

export default function AnalysisPage() {
    const [data, setData] = useState<FinancialStatement | null>(null);
    const [warnings, setWarnings] = useState<string[]>([]);
    const [showData, setShowData] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Load from local storage (Provisional for MVP)
        const storedData = localStorage.getItem("financialData");
        const storedWarnings = localStorage.getItem("financialWarnings");

        if (storedData) {
            setData(JSON.parse(storedData));
        } else {
            // No data found -> Redirect to upload
            router.push("/dashboard");
        }

        if (storedWarnings) setWarnings(JSON.parse(storedWarnings));
    }, []);

    if (!data) {
        return (
            <div className="flex items-center justify-center h-[50vh] text-white/50">
                Cargando datos financieros...
            </div>
        );
    }

    // Calculate Ratios on the fly (This logic will move to a specific hook later)
    const grossMargin = (data.pnl.grossProfit / data.pnl.revenue) * 100;
    const opMargin = (data.pnl.operatingProfit / data.pnl.revenue) * 100;
    const netMargin = (data.pnl.netIncome / data.pnl.revenue) * 100;

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">

            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white/90">Análisis Financiero</h1>
                    <p className="text-white/50">Diagnóstico basado en normas IFRS Chile.</p>
                </div>
                <div className="px-4 py-2 bg-primary/10 rounded-lg border border-primary/20 text-primary text-sm font-medium">
                    Periodo: 2024 (Detectado)
                </div>
            </div>

            {/* Warnings Section */}
            {warnings.length > 0 && (
                <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 flex gap-4 items-start">
                    <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-warning font-semibold text-sm">Atención requerida en tus datos</h3>
                        <ul className="text-warning/80 text-sm list-disc pl-4 mt-1">
                            {warnings.map((w, i) => <li key={i}>{w}</li>)}
                        </ul>
                    </div>
                </div>
            )}

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KPICard
                    label="Ventas Totales"
                    value={formatCurrency(data.pnl.revenue)}
                    icon={<TrendingUp className="text-primary" />}
                />
                <KPICard
                    label="Margen Bruto"
                    value={`${grossMargin.toFixed(1)}%`}
                    subValue={formatCurrency(data.pnl.grossProfit)}
                    trend={grossMargin > 30 ? "positive" : "negative"}
                />
                <KPICard
                    label="Resultado Op."
                    value={formatCurrency(data.pnl.operatingProfit)}
                    trend={opMargin > 10 ? "positive" : "neutral"}
                />
                <KPICard
                    label="Utilidad Neta"
                    value={formatCurrency(data.pnl.netIncome)}
                    trend={netMargin > 0 ? "positive" : "negative"}
                    highlight
                />
            </div>

            {/* Financial Charts (Level 2 Upgrade) */}
            <FinancialCharts data={{ success: true, data, warnings: [], errors: [] }} />

            {/* Main Analysis Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left: Estado de Resultados Visual */}
                <div className="lg:col-span-2 glass-panel p-8 rounded-3xl">
                    <h3 className="text-xl font-semibold mb-6">Estructura de Resultados</h3>

                    <div className="space-y-4">
                        <ResultRow label="Ingresos de Explotación" value={data.pnl.revenue} isHeader />
                        <ResultRow label="(-) Costo de Ventas" value={-data.pnl.cogs} color="text-red-400" />
                        <div className="h-px bg-white/10 my-2" />
                        <ResultRow label="= Margen Bruto" value={data.pnl.grossProfit} isTotal />

                        <ResultRow label="(-) Gastos de Adm. y Ventas" value={-data.pnl.opEx} color="text-red-400" mt />
                        <div className="h-px bg-white/10 my-2" />
                        <ResultRow label="= Resultado Operacional" value={data.pnl.operatingProfit} isTotal />

                        <ResultRow label="(-) Impuestos e Intereses" value={-(data.pnl.taxes + data.pnl.interestExpense)} color="text-red-400" mt />
                        <div className="h-px bg-white/10 my-2" />
                        <ResultRow label="= Utilidad Neta" value={data.pnl.netIncome} isTotal highlight />
                    </div>
                </div>

                {/* Right: AI Improvements */}
                <div className="glass-panel p-6 rounded-3xl bg-gradient-to-br from-white/5 to-primary/5 border-primary/20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                            <CheckCircle2 size={18} />
                        </div>
                        <h3 className="text-lg font-semibold text-white">Mejoramientos</h3>
                    </div>

                    <div className="space-y-4">
                        {opMargin < 10 && (
                            <ImprovementItem
                                title="Eficiencia Operativa Baja"
                                desc="Tu margen operacional es bajo. Revisa tus gastos fijos (Arriendo, Nómina) respecto a ventas."
                                severity="high"
                            />
                        )}
                        {grossMargin < 20 && (
                            <ImprovementItem
                                title="Costos Directos Altos"
                                desc="El costo de venta consume gran parte de tus ingresos. Negocia mejor con proveedores."
                                severity="high"
                            />
                        )}
                        {netMargin > 15 && (
                            <ImprovementItem
                                title="Excelente Rentabilidad"
                                desc="Tu negocio es muy saludable. Considera reinvertir utilidades en marketing."
                                severity="low"
                            />
                        )}
                        {/* Fallback if no specific issues */}
                        {opMargin >= 10 && grossMargin >= 20 && (
                            <p className="text-white/50 text-sm">Tu estructura financiera se ve sólida. Sigue monitoreando tus gastos mensuales.</p>
                        )}
                    </div>
                </div>

            </div>

            <div className="flex justify-center pt-8">
                <button
                    onClick={() => setShowData(!showData)}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all text-sm font-medium"
                >
                    <TableIcon className="w-4 h-4" />
                    {showData ? "Ocultar Datos Brutos" : "Ver Datos Extraídos"}
                </button>
            </div>

            {showData && (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                    <DataGrid data={{ success: true, data, warnings: [], errors: [] }} />
                </div>
            )}
        </div>
    );
}

// --- Helper Components ---

function KPICard({ label, value, subValue, icon, trend, highlight }: any) {
    const trendColor = trend === "positive" ? "text-success" : trend === "negative" ? "text-error" : "text-white/50";
    return (
        <div className={`glass-panel p-5 rounded-2xl flex flex-col gap-2 ${highlight ? "bg-primary/10 border-primary/30" : ""}`}>
            <div className="flex justify-between items-start">
                <span className="text-white/50 text-sm font-medium">{label}</span>
                {icon}
            </div>
            <div className="text-2xl font-bold text-white/90 font-mono tracking-tight">{value}</div>
            <div className="flex items-center gap-2 text-xs">
                {trend === "positive" && <ArrowUpRight className="w-3 h-3 text-success" />}
                {trend === "negative" && <ArrowDownRight className="w-3 h-3 text-error" />}
                {subValue && <span className="text-white/40">{subValue}</span>}
            </div>
        </div>
    )
}

function ResultRow({ label, value, isHeader, isTotal, highlight, mt, color }: any) {
    return (
        <div className={`flex justify-between items-center ${mt ? "mt-6" : ""} ${highlight ? "p-3 bg-white/5 rounded-lg border border-white/5" : ""}`}>
            <span className={`${isHeader || isTotal ? "font-semibold text-white/90" : "text-white/60"} ${isTotal ? "text-lg" : "text-sm"}`}>
                {label}
            </span>
            <span className={`font-mono ${isTotal ? "text-xl font-bold" : "text-sm"} ${color || "text-white/80"}`}>
                {formatCurrency(value)}
            </span>
        </div>
    )
}

function ImprovementItem({ title, desc, severity }: any) {
    return (
        <div className="p-4 rounded-xl bg-black/20 border border-white/5 hover:border-white/10 transition-colors">
            <h4 className={`text-sm font-semibold mb-1 ${severity === "high" ? "text-error" : "text-success"}`}>{title}</h4>
            <p className="text-xs text-white/60 leading-relaxed">{desc}</p>
        </div>
    )
}

function formatCurrency(val: number) {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val);
}
