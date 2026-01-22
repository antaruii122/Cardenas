"use client";

import { useState } from "react";
import { FinancialStatement } from "@/lib/types";
import { formatCLP } from "@/lib/formatters";
import { Activity, Droplets, TrendingUp, ShieldCheck } from "lucide-react";

interface Props {
    statement: FinancialStatement;
}

type RatioCategory = 'liquidity' | 'efficiency' | 'profitability' | 'solvency';

interface FlipCardProps {
    item: any;
    isFlipped: boolean;
    onFlip: () => void;
}

function FlipCard({ item, isFlipped, onFlip }: FlipCardProps) {
    const hasValue = item.value !== null && item.value !== undefined;

    return (
        <div
            onClick={onFlip}
            className="relative h-48 cursor-pointer perspective-1000"
            style={{ perspective: '1000px' }}
        >
            <div
                className={`relative w-full h-full transition-transform duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
                style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
            >
                {/* FRONT SIDE */}
                <div
                    className="absolute inset-0 backface-hidden group p-4 bg-[#0B0F17] border border-white/5 rounded-xl hover:border-blue-500/30 hover:bg-white/5 transition-all"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">{item.label}</span>
                        <div className="text-gray-600 group-hover:text-blue-400 transition-colors">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 16v-4M12 8h.01" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex items-baseline gap-1 mb-3">
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

                    <div className="absolute bottom-3 right-3 text-[10px] text-gray-600 italic">
                        Click para ver fórmula
                    </div>
                </div>

                {/* BACK SIDE */}
                <div
                    className="absolute inset-0 backface-hidden p-4 bg-gradient-to-br from-blue-950/40 to-[#0B0F17] border border-blue-500/30 rounded-xl"
                    style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                    }}
                >
                    <div className="h-full flex flex-col justify-between">
                        <div>
                            <h4 className="text-sm font-medium text-white mb-1">{item.label}</h4>
                            <p className="text-[10px] text-gray-400 mb-3">{item.desc}</p>

                            <div className="p-2 bg-[#0B0F17]/50 rounded border border-white/5 mb-3">
                                <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">Fórmula</div>
                                <code className="text-[11px] text-blue-300 font-mono">{item.formula}</code>
                            </div>

                            <div className="space-y-1 text-[11px]">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">{item.math.nLabel}</span>
                                    <span className="font-mono text-gray-200">
                                        {item.math.n !== null && item.math.n !== undefined ? formatCLP(item.math.n) : 'N/A'}
                                    </span>
                                </div>
                                <div className="h-px bg-white/10 w-full" />
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">{item.math.dLabel}</span>
                                    <span className="font-mono text-gray-200">
                                        {item.math.d !== null && item.math.d !== undefined ? formatCLP(item.math.d) : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                            <span className="text-xs font-medium text-white">Resultado</span>
                            <span className="text-lg font-mono text-blue-400">
                                {hasValue
                                    ? (item.suffix === "$" ? formatCLP(item.value) : item.value.toFixed(1))
                                    : "Faltan datos"
                                }
                                {hasValue && item.suffix !== "$" && <span className="text-xs text-gray-500 ml-1">{item.suffix}</span>}
                            </span>
                        </div>

                        <div className="text-[9px] text-gray-600 italic text-center mt-2">
                            Click para volver
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function StrategicRatiosPanel({ statement }: Props) {
    const [activeTab, setActiveTab] = useState<RatioCategory>('profitability');
    const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

    const r = statement.ratios;
    const p = statement.pnl;
    const b = statement.balanceSheet;

    const tabs = [
        { id: 'profitability', label: 'Rentabilidad', icon: <TrendingUp size={16} /> },
        { id: 'liquidity', label: 'Liquidez', icon: <Droplets size={16} /> },
        { id: 'efficiency', label: 'Eficiencia', icon: <Activity size={16} /> },
        { id: 'solvency', label: 'Solvencia', icon: <ShieldCheck size={16} /> },
    ];

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
                label: "ROA", value: r.roa, suffix: "%", ideal: "> 5%", desc: "Retorno sobre activos totales.",
                formula: "Utilidad Neta / Activos Totales",
                math: { n: p.netIncome, nLabel: "Utilidad Neta", d: b.totalAssets, dLabel: "Activos Totales" }
            },
            {
                label: "ROE", value: r.roe, suffix: "%", ideal: "> 15%", desc: "Retorno sobre patrimonio.",
                formula: "Utilidad Neta / Patrimonio",
                math: { n: p.netIncome, nLabel: "Utilidad Neta", d: b.shareholdersEquity, dLabel: "Patrimonio" }
            },
        ],
        liquidity: [
            { label: "Razón Corriente", value: r.currentRatio, suffix: "x", ideal: "> 1.5x", desc: "Capacidad de pagar obligaciones de corto plazo.", formula: "Activos Corrientes / Pasivos Corrientes", math: { n: b.currentAssets, nLabel: "Activos Corrientes", d: b.currentLiabilities, dLabel: "Pasivos Corrientes" } },
            { label: "Prueba Ácida", value: r.quickRatio, suffix: "x", ideal: "> 1x", desc: "Liquidez sin depender del inventario.", formula: "(Activos Corrientes - Inventario) / Pasivos Corrientes", math: { n: b.currentAssets - b.inventory, nLabel: "Act. Corrientes - Inv.", d: b.currentLiabilities, dLabel: "Pasivos Corrientes" } },
            { label: "Razón de Caja", value: r.cashRatio, suffix: "x", ideal: "> 0.5x", desc: "Liquidez inmediata solo con efectivo.", formula: "Efectivo / Pasivos Corrientes", math: { n: b.cash, nLabel: "Efectivo", d: b.currentLiabilities, dLabel: "Pasivos Corrientes" } },
            { label: "Capital de Trabajo", value: r.workingCapital, suffix: "$", ideal: "> 0", desc: "Recursos disponibles para operaciones.", formula: "Activos Corrientes - Pasivos Corrientes", math: { n: b.currentAssets, nLabel: "Activos Corrientes", d: b.currentLiabilities, dLabel: "Pasivos Corrientes" } },
        ],
        efficiency: [
            { label: "Rotación Activos", value: r.assetTurnover, suffix: "x", ideal: "> 1x", desc: "Eficiencia en uso de activos para generar ventas.", formula: "Ventas / Activos Totales", math: { n: p.revenue, nLabel: "Ventas", d: b.totalAssets, dLabel: "Activos Totales" } },
            { label: "Rotación Inventario", value: r.inventoryTurnover, suffix: "x", ideal: "> 4x", desc: "Veces que se vende el inventario al año.", formula: "Costo de Ventas / Inventario", math: { n: Math.abs(p.cogs), nLabel: "Costo de Ventas", d: b.inventory, dLabel: "Inventario" } },
            { label: "Días Inventario (DIO)", value: r.daysInventoryOutstanding, suffix: "días", ideal: "< 90", desc: "Días promedio que permanece el inventario.", formula: "(Inventario / Costo de Ventas) × 365", math: { n: b.inventory, nLabel: "Inventario", d: Math.abs(p.cogs), dLabel: "Costo de Ventas" } },
            { label: "Rotación CxC", value: r.receivablesTurnover, suffix: "x", ideal: "> 6x", desc: "Eficiencia en cobro de cuentas.", formula: "Ventas / Cuentas por Cobrar", math: { n: p.revenue, nLabel: "Ventas", d: b.accountsReceivable, dLabel: "Cuentas por Cobrar" } },
            { label: "Días Cobro (DSO)", value: r.daysSalesOutstanding, suffix: "días", ideal: "< 60", desc: "Días promedio para cobrar ventas.", formula: "(Cuentas por Cobrar / Ventas) × 365", math: { n: b.accountsReceivable, nLabel: "Cuentas por Cobrar", d: p.revenue, dLabel: "Ventas" } },
            { label: "Días Pago (DPO)", value: r.daysPayablesOutstanding, suffix: "días", ideal: "> 30", desc: "Días promedio para pagar proveedores.", formula: "(Cuentas por Pagar / Costo de Ventas) × 365", math: { n: b.accountsPayable, nLabel: "Cuentas por Pagar", d: Math.abs(p.cogs), dLabel: "Costo de Ventas" } },
            { label: "Ciclo de Conversión", value: r.cashConversionCycle, suffix: "días", ideal: "< 60", desc: "Días desde pago a proveedores hasta cobro.", formula: "DIO + DSO - DPO", math: { n: (r.daysInventoryOutstanding || 0) + (r.daysSalesOutstanding || 0), nLabel: "DIO + DSO", d: r.daysPayablesOutstanding || 0, dLabel: "DPO" } },
        ],
        solvency: [
            { label: "Deuda / Patrimonio", value: r.debtToEquity, suffix: "x", ideal: "< 1.5x", desc: "Nivel de apalancamiento financiero.", formula: "Pasivos Totales / Patrimonio", math: { n: b.totalLiabilities, nLabel: "Pasivos Totales", d: b.shareholdersEquity, dLabel: "Patrimonio" } },
            { label: "Razón de Deuda", value: r.debtRatio, suffix: "%", ideal: "< 60%", desc: "% de activos financiados con deuda.", formula: "Pasivos Totales / Activos Totales", math: { n: b.totalLiabilities, nLabel: "Pasivos Totales", d: b.totalAssets, dLabel: "Activos Totales" } },
            { label: "Cobertura Intereses", value: r.interestCoverage, suffix: "x", ideal: "> 3x", desc: "Capacidad operativa para pagar intereses.", formula: "EBIT / Gastos Financieros", math: { n: p.operatingProfit, nLabel: "Resultado Op.", d: Math.abs(p.interestExpense), dLabel: "Gastos Fin." } },
        ]
    };

    const currentRatios = ratioConfig[activeTab];

    const handleFlip = (idx: number) => {
        setFlippedCards(prev => {
            const newSet = new Set(prev);
            if (newSet.has(idx)) {
                newSet.delete(idx);
            } else {
                newSet.add(idx);
            }
            return newSet;
        });
    };

    return (
        <div className="flex flex-col h-full bg-[#151B26] border border-white/5 rounded-2xl overflow-hidden relative">
            {/* Tabs Header */}
            <div className="flex border-b border-white/5 overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id as RatioCategory);
                            setFlippedCards(new Set()); // Reset flipped cards when changing tabs
                        }}
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

            {/* Content Grid with Flip Cards */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
                {currentRatios.map((item, idx) => (
                    <FlipCard
                        key={idx}
                        item={item}
                        isFlipped={flippedCards.has(idx)}
                        onFlip={() => handleFlip(idx)}
                    />
                ))}
            </div>
        </div>
    );
}
