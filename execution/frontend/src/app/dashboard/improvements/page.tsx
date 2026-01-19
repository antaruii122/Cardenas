"use client";

import { useEffect, useState } from "react";
import { FinancialStatement } from "@/lib/types";
import { Lightbulb, ArrowRight, TrendingUp, DollarSign, Target } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ImprovementsPage() {
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

    if (!data) return <div className="text-white/50 p-10">Generando recomendaciones...</div>;

    // --- LOGIC: GENERATE RECOMMENDATIONS ---
    const recommendations = [];

    // 1. Cost of Goods Sold Check
    const grossMargin = (data.pnl.grossProfit / data.pnl.revenue);
    if (grossMargin < 0.30) {
        recommendations.push({
            type: "risk",
            title: "Optimización de Proveedores",
            desc: "Tu margen bruto es inferior al 30%. Esto indica que tus costos directos son muy altos.",
            action: "Renegociar contratos con proveedores principales o buscar alternativas de menor costo.",
            impact: "Impacto Potencial: +5% Margen Neto",
            icon: <DollarSign className="w-6 h-6 text-red-400" />
        });
    }

    // 2. OpEx Check
    const opexRatio = (data.pnl.opEx / data.pnl.revenue);
    if (opexRatio > 0.40) {
        recommendations.push({
            type: "warning",
            title: "Auditoría de Gastos Fijos",
            desc: "Estás gastando más del 40% de tus ventas en administración. Es un nivel peligroso.",
            action: "Revisar nómina, arriendos y suscripciones de software innecesarias.",
            impact: "Impacto Potencial: Reducción de 10% en gastos",
            icon: <Target className="w-6 h-6 text-orange-400" />
        });
    }

    // 3. Tax Optimization (Generic)
    if (data.pnl.netIncome > 0) {
        recommendations.push({
            type: "opportunity",
            title: "Beneficios Tributarios Pyme",
            desc: "Al tener utilidades positivas, podrías acogerte al Artículo 14 D N° 8.",
            action: "Consultar con contador sobre reinversión de utilidades.",
            impact: "Ahorro Fiscal Significativo",
            icon: <TrendingUp className="w-6 h-6 text-emerald-400" />
        });
    }

    // Default if doing well
    if (recommendations.length === 0) {
        recommendations.push({
            type: "success",
            title: "Expansión de Mercado",
            desc: "Tu estructura de costos es saludable. Es momento de escalar.",
            action: "Invertir excedentes en campañas de marketing agresivas.",
            impact: "Crecimiento proyectado del 20%",
            icon: <TrendingUp className="w-6 h-6 text-blue-400" />
        });
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-white/90 flex items-center gap-3">
                    <Lightbulb className="text-yellow-400" />
                    Centro de Mejoramiento
                </h1>
                <p className="text-white/50">Acciones recomendadas para optimizar la rentabilidad de tu negocio.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((rec, i) => (
                    <div key={i} className="group glass-panel p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all hover:-translate-y-1">
                        <div className="mb-4 bg-white/5 w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-colors">
                            {rec.icon}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{rec.title}</h3>
                        <p className="text-white/60 text-sm mb-6 leading-relaxed">
                            {rec.desc}
                        </p>

                        <div className="bg-primary/10 rounded-lg p-4 mb-4 border border-primary/20">
                            <div className="text-xs text-primary font-bold uppercase tracking-wider mb-1">Acción Sugerida</div>
                            <div className="text-sm text-white/90 font-medium flex items-center gap-2">
                                {rec.action}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                            <Zap className="w-3 h-3" />
                            {rec.impact}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Zap({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    )
}
