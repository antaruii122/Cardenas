"use client";

import { useState } from "react";
import { FinancialStatement } from "@/lib/types";
import { formatCLP } from "@/lib/formatters";
import { Activity, Droplets, TrendingUp, ShieldCheck, Scale, Info } from "lucide-react";

interface Props {
    statement: FinancialStatement;
}

type RatioCategory = 'liquidity' | 'efficiency' | 'profitability' | 'solvency';

export function StrategicRatiosPanel({ statement }: Props) {
    const [activeTab, setActiveTab] = useState<RatioCategory>('profitability');
    const [selectedMetric, setSelectedMetric] = useState<any | null>(null);
    const r = statement.ratios;
    const p = statement.pnl;
    const b = statement.balanceSheet;

    const tabs = [
        { id: 'profitability', label: 'Rentabilidad', icon: <TrendingUp size={16} /> },
        { id: 'liquidity', label: 'Liquidez', icon: <Droplets size={16} /> },
        { id: 'efficiency', label: 'Eficiencia', icon: <Activity size={16} /> },
        { id: 'solvency', label: 'Solvencia', icon: <ShieldCheck size={16} /> },
    ];

    // Helper to format components
    const fmt = (val: number) => formatCLP(val);

    const ratioConfig: Record<RatioCategory, Array<any>> = {
        profitability: [
            {
                label: "Márgen Bruto", value: r.grossMargin, suffix: "%", ideal: "> 30%", desc: "Beneficio directo tras costos de producción.",
                formula: "Utilidad Bruta / Ventas",
                math: { n: p.grossProfit, nLabel: "Utilidad Bruta", d: p.revenue, dLabel: "Ventas" }
            },
            {
                label: "Márgen Operativo", value: r.operatingMargin, suffix: "%", ideal: "> 10%", desc: "Rentabilidad de las operaciones centrales.",
                formula: "Resultado Operacional / Ventas",
                math: { n: p.operatingProfit, nLabel: "Res. Operacional", d: p.revenue, dLabel: "Ventas" }
            },
            {
                label: "Márgen EBITDA", value: r.ebitdaMargin, suffix: "%", ideal: "> 15%", desc: "Ganancia operativa antes de efectos financieros.",
                formula: "EBITDA / Ventas",
                math: { n: p.ebitda || p.operatingProfit, nLabel: "EBITDA", d: p.revenue, dLabel: "Ventas" }
            },
            {
                label: "Márgen Neto", value: r.netMargin, suffix: "%", ideal: "> 5%", desc: "Beneficio final para accionistas.",
                formula: "Utilidad Neta / Ventas",
                math: { n: p.netIncome, nLabel: "Utilidad Neta", d: p.revenue, dLabel: "Ventas" }
            },
            {
                label: "ROA (Activos)", value: r.roa, suffix: "%", ideal: "> 5%", desc: "Retorno sobre la inversión total en activos.",
                formula: "Utilidad Neta / Activos Totales",
                math: { n: p.netIncome, nLabel: "Utilidad Neta", d: b.totalAssets, dLabel: "Activos Totales" }
            },
            {
                label: "ROE (Patrimonio)", value: r.roe, suffix: "%", ideal: "> 10%", desc: "Retorno sobre el capital de los dueños.",
                formula: "Utilidad Neta / Patrimonio",
                math: { n: p.netIncome, nLabel: "Utilidad Neta", d: b.shareholdersEquity, dLabel: "Patrimonio" }
            },
        ],
        liquidity: [
            {
                label: "Razón Corriente", value: r.currentRatio, suffix: "x", ideal: "1.5 - 2.0x", desc: "Capacidad de cubrir deudas c/p con activos c/p.",
                formula: "Activos Cte. / Pasivos Cte.",
                math: { n: b.currentAssets, nLabel: "Activos Corrientes", d: b.currentLiabilities, dLabel: "Pasivos Corrientes" }
            },
            {
                label: "Prueba Ácida", value: r.quickRatio, suffix: "x", ideal: "> 1.0x", desc: "Pago de deudas sin depender de vender inventario.",
                formula: "(Activos Cte. - Inventario) / Pasivos Cte.",
                math: { n: b.currentAssets - b.inventory, nLabel: "Activos Líquidos", d: b.currentLiabilities, dLabel: "Pasivos Corrientes" }
            },
            {
                label: "Razón Efectivo", value: r.cashRatio, suffix: "x", ideal: "> 0.2x", desc: "Cobertura inmediata con caja disponible.",
                formula: "Efectivo / Pasivos Cte.",
                math: { n: b.cash, nLabel: "Efectivo", d: b.currentLiabilities, dLabel: "Pasivos Corrientes" }
            },
            {
                label: "Capital de Trabajo", value: r.workingCapital, suffix: "$", ideal: "Positivo", desc: "Colchón operativo tras pagar deudas.",
                formula: "Activos Cte. - Pasivos Cte.",
                math: { n: b.currentAssets, nLabel: "Activos Corrientes", d: b.currentLiabilities, dLabel: "Pasivos Corrientes", op: "-" }
            },
        ],
        efficiency: [
            { label: "Días Inventario (DIO)", value: r.daysInventoryOutstanding, suffix: " días", ideal: "Bajo", desc: "Tiempo promedio en vender el inventario.", formula: "(Inventario * 365) / Costo Ventas", math: { n: b.inventory * 365, nLabel: "Inventario x 365", d: Math.abs(p.cogs), dLabel: "Costo Ventas" } },
            { label: "Días Cobro (DSO)", value: r.daysSalesOutstanding, suffix: " días", ideal: "< 45", desc: "Tiempo promedio en cobrar a clientes.", formula: "(CxC * 365) / Ventas", math: { n: b.accountsReceivable * 365, nLabel: "CxC x 365", d: p.revenue, dLabel: "Ventas" } },
            { label: "Días Pago (DPO)", value: r.daysPayablesOutstanding, suffix: " días", ideal: "Estratégico", desc: "Tiempo promedio en pagar a proveedores.", formula: "(CxP * 365) / Costo Ventas", math: { n: b.accountsPayable * 365, nLabel: "CxP x 365", d: Math.abs(p.cogs), dLabel: "Costo Ventas" } },
            { label: "Rotación Activos", value: r.assetTurnover, suffix: "x", ideal: "> 1x", desc: "Eficiencia de activos para generar ventas.", formula: "Ventas / Activos Totales", math: { n: p.revenue, nLabel: "Ventas", d: b.totalAssets, dLabel: "Activos Totales" } },
        ],
        solvency: [
            { label: "Deuda / Patrimonio", value: r.debtToEquity, suffix: "x", ideal: "< 1.5x", desc: "Nivel de apalancamiento financiero.", formula: "Pasivos Totales / Patrimonio", math: { n: b.totalLiabilities, nLabel: "Pasivos Totales", d: b.shareholdersEquity, dLabel: "Patrimonio" } },
            { label: "Razón de Deuda", value: r.debtRatio, suffix: "%", ideal: "< 60%", desc: "% de activos financiados con deuda.", formula: "Pasivos Totales / Activos Totales", math: { n: b.totalLiabilities, nLabel: "Pasivos Totales", d: b.totalAssets, dLabel: "Activos Totales" } },
            { label: "Cobertura Intereses", value: r.interestCoverage, suffix: "x", ideal: "> 3x", desc: "Capacidad operativa para pagar intereses.", formula: "EBIT / Gastos Financieros", math: { n: p.operatingProfit, nLabel: "Resultado Op.", d: Math.abs(p.interestExpense), dLabel: "Gastos Fin." } },
        ]
    };

    const currentRatios = ratioConfig[activeTab];

    return (
        <div className="flex flex-col h-full bg-[#151B26] border border-white/5 rounded-2xl overflow-hidden relative">
            {/* Tabs Header */}
            <div className="flex border-b border-white/5 overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as RatioCategory)}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === tab.id
                            ? "text-blue-400 bg-blue-500/5"
                            : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 shadow-[0_-2px_8px_rgba(59,130,246,0.5)]" />
                        )}
                    </button>
                ))}
            </div>

            {/* Content Grid */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
                {currentRatios.map((item, idx) => {
                    const hasValue = item.value !== null && item.value !== undefined;
                    return (
                        <div
                            key={idx}
                            onClick={() => hasValue && setSelectedMetric(item)}
                            className={`group p-4 bg-[#0B0F17] border border-white/5 rounded-xl transition-all relative ${hasValue ? 'cursor-pointer hover:border-blue-500/30 hover:bg-white/5' : 'opacity-70'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">{item.label}</span>
                                {hasValue && (
                                    <div className="text-gray-600 group-hover:text-blue-400 transition-colors">
                                        <Info size={14} />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-baseline gap-1">
                                <span className={`text-2xl font-mono font-medium ${hasValue ? 'text-gray-200 group-hover:text-white' : 'text-gray-600'}`}>
                                    {hasValue
                                        ? (item.suffix === "$" ? formatCLP(item.value) : item.value.toFixed(1))
                                        : "N/A"
                                    }
                                </span>
                                {hasValue && item.suffix !== "$" && <span className="text-xs text-gray-500">{item.suffix}</span>}
                            </div>

                            {hasValue && (
                                <div className="mt-3 flex items-center gap-2">
                                    <div className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] text-gray-400 font-mono">
                                        Meta: {item.ideal}
                                    </div>
                                </div>
                            )}

                            {!hasValue && (
                                <div className="mt-2 text-[10px] text-gray-600 italic">
                                    Requiere datos adicionales
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Math Proof Modal (Backdrop Blur) */}
            {selectedMetric && (
                <div
                    className="absolute inset-0 z-50 bg-[#0B0F17]/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200"
                    onClick={() => setSelectedMetric(null)}
                >
                    <div
                        className="bg-[#151B26] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedMetric(null)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white"
                        >
                            ✕
                        </button>

                        <h3 className="text-lg font-medium text-white mb-1">{selectedMetric.label}</h3>
                        <p className="text-sm text-gray-400 mb-6">{selectedMetric.desc}</p>

                        <div className="space-y-4">
                            <div className="p-4 bg-[#0B0F17] rounded-xl border border-white/5">
                                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Fórmula</div>
                                <code className="text-sm text-blue-300 font-mono">{selectedMetric.formula}</code>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">{selectedMetric.math.nLabel}</span>
                                    <span className="font-mono text-gray-200">{formatCLP(selectedMetric.math.n)}</span>
                                </div>
                                <div className="h-px bg-white/10 w-full" />
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">{selectedMetric.math.dLabel}</span>
                                    <span className="font-mono text-gray-200">{formatCLP(selectedMetric.math.d)}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                                <span className="font-medium text-white">Resultado</span>
                                <span className="text-xl font-mono text-blue-400">
                                    {selectedMetric.suffix === "$" ? formatCLP(selectedMetric.value) : selectedMetric.value.toFixed(1)}
                                    <span className="text-sm text-gray-500 ml-1">{selectedMetric.suffix !== "$" && selectedMetric.suffix}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
