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
    const r = statement.ratios;

    const tabs = [
        { id: 'profitability', label: 'Rentabilidad', icon: <TrendingUp size={16} /> },
        { id: 'liquidity', label: 'Liquidez', icon: <Droplets size={16} /> },
        { id: 'efficiency', label: 'Eficiencia', icon: <Activity size={16} /> },
        { id: 'solvency', label: 'Solvencia', icon: <ShieldCheck size={16} /> },
    ];

    const ratioConfig: Record<RatioCategory, Array<any>> = {
        profitability: [
            { label: "Márgen Bruto", value: r.grossMargin, suffix: "%", ideal: "> 30%", desc: "Beneficio directo tras costos de producción." },
            { label: "Márgen Operativo", value: r.operatingMargin, suffix: "%", ideal: "> 10%", desc: "Rentabilidad de las operaciones centrales." },
            { label: "Márgen EBITDA", value: r.ebitdaMargin, suffix: "%", ideal: "> 15%", desc: "Ganancia operativa antes de efectos financieros." },
            { label: "Márgen Neto", value: r.netMargin, suffix: "%", ideal: "> 5%", desc: "Beneficio final para accionistas." },
            { label: "ROA (Activos)", value: r.roa, suffix: "%", ideal: "> 5%", desc: "Retorno sobre la inversión total en activos." },
            { label: "ROE (Patrimonio)", value: r.roe, suffix: "%", ideal: "> 10%", desc: "Retorno sobre el capital de los dueños." },
        ],
        liquidity: [
            { label: "Razón Corriente", value: r.currentRatio, suffix: "x", ideal: "1.5 - 2.0x", desc: "Capacidad de cubrir deudas c/p con activos c/p." },
            { label: "Prueba Ácida", value: r.quickRatio, suffix: "x", ideal: "> 1.0x", desc: "Pago de deudas sin depender de vender inventario." },
            { label: "Razón Efectivo", value: r.cashRatio, suffix: "x", ideal: "> 0.2x", desc: "Cobertura inmediata con caja disponible." },
            { label: "Capital de Trabajo", value: r.workingCapital, suffix: "$", ideal: "Positivo", desc: "Colchón operativo tras pagar deudas." },
        ],
        efficiency: [
            { label: "Días Inventario (DIO)", value: r.daysInventoryOutstanding, suffix: " días", ideal: "Bajo", desc: "Tiempo promedio en vender el inventario." },
            { label: "Días Cobro (DSO)", value: r.daysSalesOutstanding, suffix: " días", ideal: "< 45", desc: "Tiempo promedio en cobrar a clientes." },
            { label: "Días Pago (DPO)", value: r.daysPayablesOutstanding, suffix: " días", ideal: "Estratégico", desc: "Tiempo promedio en pagar a proveedores." },
            { label: "Ciclo de Caja (CCC)", value: r.cashConversionCycle, suffix: " días", ideal: "Bajo/Neg", desc: "Tiempo que el dinero pasa inmovilizado." },
            { label: "Rotación Activos", value: r.assetTurnover, suffix: "x", ideal: "> 1x", desc: "Eficiencia de activos para generar ventas." },
        ],
        solvency: [
            { label: "Deuda / Patrimonio", value: r.debtToEquity, suffix: "x", ideal: "< 1.5x", desc: "Nivel de apalancamiento financiero." },
            { label: "Razón de Deuda", value: r.debtRatio, suffix: "%", ideal: "< 60%", desc: "% de activos financiados con deuda." },
            { label: "Cobertura Intereses", value: r.interestCoverage, suffix: "x", ideal: "> 3x", desc: "Capacidad operativa para pagar intereses." },
        ]
    };

    const currentRatios = ratioConfig[activeTab];

    return (
        <div className="flex flex-col h-full bg-[#151B26] border border-white/5 rounded-2xl overflow-hidden">
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
                        <div key={idx} className="group p-4 bg-[#0B0F17] border border-white/5 rounded-xl hover:border-white/20 transition-all relative">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">{item.label}</span>
                                {hasValue && (
                                    <div className="cursor-help text-gray-600 hover:text-gray-400 transition-colors" title={item.desc}>
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
                                    Faltan datos para calcular
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
