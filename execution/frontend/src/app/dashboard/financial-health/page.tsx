"use client";

import { useEffect, useState } from "react";
import { FinancialStatement } from "@/lib/types";
import { calculateFinancialHealth, FinancialHealthReport } from "@/lib/financial-math";
import { Activity, ShieldCheck, Zap, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function FinancialHealthPage() {
    const [data, setData] = useState<FinancialStatement | null>(null);
    const [report, setReport] = useState<FinancialHealthReport | null>(null);
    const router = useRouter();

    useEffect(() => {
        const storedData = localStorage.getItem("financialData");
        if (storedData) {
            const parsed: FinancialStatement = JSON.parse(storedData);
            setData(parsed);

            // STRICT MATH CALCULATION
            const healthReport = calculateFinancialHealth(parsed);
            setReport(healthReport);
        } else {
            // router.push("/dashboard"); 
            // For dev/demo, maybe don't redirect immediately? 
            // sticking to redirect for now to ensure data integrity
            router.push("/dashboard");
        }
    }, [router]);

    if (!data || !report) return <div className="flex items-center justify-center h-[50vh] text-muted-foreground animate-pulse">Ejecutando Diagnóstico...</div>;

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">

            {/* Header / Vital Signs */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-card p-8 md:p-12">
                <div className="absolute inset-0 bg-grain opacity-50 pointer-events-none" />
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                    <div>
                        <h1 className="text-display text-4xl md:text-5xl font-medium text-white mb-2">Signos Vitales Financieros</h1>
                        <p className="text-muted-foreground font-light text-lg">Análisis riguroso de ratios contables estrictos.</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right hidden md:block">
                            <div className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Puntaje Global</div>
                            <div className={`text-sm ${report.overallScore >= 70 ? "text-emerald-400" : report.overallScore >= 50 ? "text-amber-400" : "text-red-400"}`}>
                                {report.overallScore >= 70 ? "ÓPTIMO" : report.overallScore >= 50 ? "ALERTA" : "CRÍTICO"}
                            </div>
                        </div>
                        <div className="relative flex items-center justify-center w-32 h-32">
                            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" className="stroke-white/5 fill-none" strokeWidth="8" />
                                <motion.circle
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: report.overallScore / 100 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    cx="50" cy="50" r="45"
                                    className={`fill-none ${report.overallScore >= 70 ? "stroke-emerald-500" : report.overallScore >= 50 ? "stroke-amber-500" : "stroke-red-500"}`}
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <span className="text-4xl font-display font-bold text-white">{report.overallScore}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Grid: Liquidity, Solvency, Efficiency, Profitability */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Liquidez"
                    score={report.liquidity.score}
                    icon={<Activity className="w-5 h-5 text-blue-400" />}
                    metrics={[
                        { label: "Razón Corriente", value: report.liquidity.currentRatio.value.toFixed(2) + "x", status: report.liquidity.currentRatio.status },
                        { label: "Prueba Ácida (Quick)", value: report.liquidity.quickRatio.value.toFixed(2) + "x", status: report.liquidity.quickRatio.status },
                    ]}
                />
                <MetricCard
                    title="Solvencia"
                    score={report.solvency.score}
                    icon={<ShieldCheck className="w-5 h-5 text-purple-400" />}
                    metrics={[
                        { label: "Deuda / Patrimonio", value: report.solvency.debtToEquity.value.toFixed(2), status: report.solvency.debtToEquity.status },
                        { label: "Cob. Intereses", value: report.solvency.interestCoverage.value.toFixed(1) + "x", status: report.solvency.interestCoverage.status },
                    ]}
                />
                <MetricCard
                    title="Eficiencia"
                    score={report.efficiency.score}
                    icon={<Zap className="w-5 h-5 text-amber-400" />}
                    metrics={[
                        { label: "Rot. Activos", value: report.efficiency.assetTurnover.value.toFixed(2), status: report.efficiency.assetTurnover.status },
                        // Only show Inventory Turnover if relevant (not null)
                        ...(report.efficiency.inventoryTurnover ? [{ label: "Rot. Inventario", value: report.efficiency.inventoryTurnover.value.toFixed(1), status: report.efficiency.inventoryTurnover.status }] : []),
                    ]}
                />
                <MetricCard
                    title="Rentabilidad"
                    score={report.profitability.score}
                    icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
                    metrics={[
                        { label: "Margen Neto", value: (report.profitability.netMargin.value * 100).toFixed(1) + "%", status: report.profitability.netMargin.status },
                        { label: "ROE", value: (report.profitability.roe.value * 100).toFixed(1) + "%", status: report.profitability.roe.status },
                    ]}
                />
            </div>

            {/* AI Advisor Section */}
            <div className="glass-panel p-8 rounded-3xl border border-primary/20 bg-primary/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />

                <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 text-primary">
                        <Zap size={20} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-display font-medium text-white">Consejería Estratégica</h2>
                        <p className="text-sm text-primary/70 font-mono uppercase tracking-wider">Análisis IA v1.0</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                    <div className="lg:col-span-2 space-y-6">
                        <p className="text-lg text-white/80 leading-relaxed font-light">
                            Basado en tus ratios financieros estrictos, la IA ha detectado oportunidades específicas de mejora.
                            <br /><br />
                            <span className="text-white/40 italic text-sm">[Nota del sistema: La conexión con la IA en vivo se está estableciendo. Abajo una simulación basada en tus puntajes.]</span>
                        </p>

                        {/* Dynamic Mock Advice based on Score */}
                        <div className="space-y-4">
                            {report.liquidity.score < 60 && (
                                <AdviceItem
                                    type="Critical"
                                    title="Restricción de Liquidez Detectada"
                                    desc="Tu Prueba Ácida está bajo 1.0. Estás en riesgo de no cubrir obligaciones de corto plazo sin vender inventario. Considera factoring inmediato."
                                />
                            )}
                            {report.profitability.score > 80 && (
                                <AdviceItem
                                    type="Opportunity"
                                    title="Alta Eficiencia / Bajo Apalancamiento"
                                    desc="Tu ROE es excelente y la deuda es baja. Tienes espacio para apalancar deuda barata para financiar expansión agresiva."
                                />
                            )}
                            {report.liquidity.score >= 60 && report.profitability.score <= 60 && (
                                <AdviceItem
                                    type="Warning"
                                    title="Exceso de Grasa Operativa"
                                    desc="Tienes caja, pero los márgenes son delgados. Audita tus costos fijos (OpEx) inmediatamente."
                                />
                            )}
                        </div>

                    </div>

                    <div className="lg:col-span-1 border-l border-white/10 pl-8 hidden lg:block">
                        <h4 className="text-sm font-mono text-white/40 mb-4 uppercase">Datos de Referencia</h4>
                        <div className="space-y-4 text-sm text-white/60">
                            <div className="flex justify-between">
                                <span>Prom. Industria (Mg. Neto)</span>
                                <span className="text-white">12.5%</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Prom. Industria (Quick)</span>
                                <span className="text-white">1.1x</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

// --- Components ---

function MetricCard({ title, score, icon, metrics }: { title: string, score: number, icon: React.ReactNode, metrics: { label: string, value: string, status: string }[] }) {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/5">{icon}</div>
                    <h3 className="text-lg font-medium text-white">{title}</h3>
                </div>
                <div className={`text-lg font-bold font-mono ${score >= 70 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-red-400"}`}>
                    {score}/100
                </div>
            </div>

            <div className="h-px bg-white/10 w-full" />

            <div className="space-y-3">
                {metrics.map((m, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground font-light">{m.label}</span>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-white/90">{m.value}</span>
                            <StatusIndicator status={m.status} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function StatusIndicator({ status }: { status: string }) {
    if (status === "Good") return <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
    if (status === "Warning") return <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
    if (status === "Critical") return <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
    return <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
}

function AdviceItem({ type, title, desc }: { type: "Critical" | "Warning" | "Opportunity", title: string, desc: string }) {
    const colors = {
        Critical: "border-red-500/50 bg-red-500/10 text-red-100",
        Warning: "border-amber-500/50 bg-amber-500/10 text-amber-100",
        Opportunity: "border-emerald-500/50 bg-emerald-500/10 text-emerald-100",
    }
    const icons = {
        Critical: <AlertTriangle className="w-5 h-5 text-red-400" />,
        Warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
        Opportunity: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    }

    return (
        <div className={`p-4 rounded-xl border ${colors[type]} flex gap-4 items-start`}>
            <div className="mt-1 shrink-0">{icons[type]}</div>
            <div>
                <h4 className="font-medium text-base mb-1">{title}</h4>
                <p className="text-sm opacity-80 font-light leading-relaxed">{desc}</p>
            </div>
        </div>
    )
}
