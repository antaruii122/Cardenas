"use client";

import { useEffect, useState } from "react";
import { FinancialStatement } from "@/lib/types";
import { Activity, ShieldCheck, Zap, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    RadialBarChart, RadialBar, Legend
} from "recharts";

export default function SEEPage() {
    const [data, setData] = useState<FinancialStatement | null>(null);
    const router = useRouter();

    useEffect(() => {
        const storedData = localStorage.getItem("financialData");
        if (storedData) {
            setData(JSON.parse(storedData));
        } else {
            router.push("/dashboard");
        }
    }, []);

    if (!data) return <div className="text-white/50 p-10">Cargando reporte S.E.E...</div>;

    // --- CALCULATIONS (Proxies for S.E.E.) ---

    // 1. SOLVENCIA (Solvency)
    // Proxy: Interest Coverage Ratio (EBIT / Interest Expense)
    // If Interest is 0, we assume infinite coverage (limited by reasonable max)
    const ebit = data.pnl.operatingProfit;
    const interest = Math.abs(data.pnl.interestExpense);
    const solvencyRatio = interest === 0 ? 10 : (ebit / interest);
    const solvencyScore = Math.min(solvencyRatio, 10); // Cap at 10x
    const solvencyStatus = solvencyScore > 3 ? "Sólida" : solvencyScore > 1.5 ? "Aceptable" : "Riesgosa";

    // 2. ESTABILIDAD (Stability)
    // Proxy: Fixed Cost Coverage (Gross Profit / OpEx)
    // How many times does Gross Profit cover Operational Expenses?
    // < 1 means we are burning cash on operations.
    const stabilityRatio = data.pnl.opEx === 0 ? 10 : (data.pnl.grossProfit / data.pnl.opEx);
    const stabilityScore = Math.min(stabilityRatio * 20, 100); // Scale to 100
    const stabilityStatus = stabilityRatio > 1.2 ? "Estable" : stabilityRatio > 1 ? "Ajustada" : "Inestable";

    // 3. EFICIENCIA (Efficiency)
    // Proxy: OpEx as % of Revenue. Lower is better.
    const efficiencyRatio = (data.pnl.opEx / data.pnl.revenue);
    const efficiencyScore = Math.max(0, 100 - (efficiencyRatio * 100)); // 100 - %OpEx
    const efficiencyStatus = efficiencyRatio < 0.2 ? "Alta" : efficiencyRatio < 0.4 ? "Media" : "Baja";

    // Data for charts
    const solvencyData = [
        { name: 'Cobertura Intereses', value: solvencyScore, fill: '#8b5cf6' },
        { name: 'Máximo', value: 10 - solvencyScore, fill: '#334155' }
    ];

    const efficiencyChartData = [
        { name: 'Gastos Oper.', value: data.pnl.opEx },
        { name: 'Utilidad Oper.', value: data.pnl.operatingProfit }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-white/90 flex items-center gap-3">
                    <Activity className="text-primary" />
                    Reporte S.E.E.
                </h1>
                <p className="text-white/50">Análisis de Solvencia, Estabilidad y Eficiencia Operativa.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. SOLVENCIA CARD */}
                <SEECard title="Solvencia" score={solvencyStatus} color="text-violet-400" icon={<ShieldCheck />}>
                    <div className="h-[150px] w-full mt-4 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart outerRadius="140%" innerRadius="80%" data={[{ value: (solvencyScore / 10) * 100, fill: '#8b5cf6' }]} startAngle={180} endAngle={0}>
                                <RadialBar background dataKey="value" cornerRadius={10} />
                            </RadialBarChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-end justify-center pb-2">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-violet-400">{solvencyRatio === 10 ? ">10x" : `${solvencyRatio.toFixed(1)}x`}</div>
                                <div className="text-xs text-white/50">Cobertura Intereses</div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 p-3 bg-white/5 rounded-lg text-sm text-white/70">
                        {solvencyStatus === "Sólida"
                            ? "Tu empresa genera suficiente caja operativa para cubrir sus deudas financieras cómodamente."
                            : "Atención: La carga financiera es alta respecto a tu generación operativa."}
                    </div>
                </SEECard>

                {/* 2. ESTABILIDAD CARD */}
                <SEECard title="Estabilidad" score={stabilityStatus} color="text-emerald-400" icon={<Zap />}>
                    <div className="h-[180px] w-full mt-2 flex items-center justify-center">
                        <div className="w-full space-y-4">
                            <div className="flex justify-between text-sm text-white/70">
                                <span>Margen Bruto</span>
                                <span>{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(data.pnl.grossProfit)}</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2">
                                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                            </div>

                            <div className="flex justify-between text-sm text-white/70">
                                <span>Gastos Fijos (Est.)</span>
                                <span>{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(data.pnl.opEx)}</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2">
                                <div className={`h-2 rounded-full ${stabilityRatio >= 1 ? 'bg-emerald-500/50' : 'bg-red-500'}`} style={{ width: `${Math.min((1 / stabilityRatio) * 100, 100)}%` }}></div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 p-3 bg-white/5 rounded-lg text-sm text-white/70 line-clamp-3">
                        {stabilityRatio > 1
                            ? "Tus ingresos cubren totalmente sus costos fijos y variables. El negocio es autosustentable."
                            : "Alerta: Tus gastos operativos superan tu margen bruto. Estás quemando capital."}
                    </div>
                </SEECard>

                {/* 3. EFICIENCIA CARD */}
                <SEECard title="Eficiencia" score={efficiencyStatus} color="text-blue-400" icon={<Activity />}>
                    <div className="h-[150px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={efficiencyChartData} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10, fill: '#fff' }} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                                />
                                <Bar dataKey="value" fill="#60a5fa" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 p-3 bg-white/5 rounded-lg text-sm text-white/70">
                        Gastas <b>{((efficiencyRatio) * 100).toFixed(1)}%</b> de tus ingresos en operar.
                        {efficiencyStatus === "Alta" ? " Excelente gestión de costos." : " Hay espacio para optimizar procesos."}
                    </div>
                </SEECard>

            </div>
        </div>
    );
}

function SEECard({ title, score, color, icon, children }: any) {
    return (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-white/5">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg bg-white/5 ${color}`}>{icon}</div>
                    <h3 className="font-semibold text-lg text-white/90">{title}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${color.replace('text', 'border').replace('400', '500/30')} ${color.replace('text', 'bg').replace('400', '500/10')} ${color}`}>
                    {score}
                </span>
            </div>
            {children}
        </div>
    );
}
