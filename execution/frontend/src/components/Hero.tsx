"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export function Hero() {
    const router = useRouter();

    const handleStartAnalysis = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Navigating to dashboard...");
        router.push("/dashboard");
    };

    return (
        <div className="text-center flex flex-col items-center gap-6 mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative z-50">
            <div className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sm font-medium text-primary-foreground/80 mb-4 inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                Diseñado para Chile 🇨🇱
            </div>

            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                Tu Estado de Resultados,<br />
                <span className="text-primary">Optimizado.</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/60 max-w-2xl text-center leading-relaxed">
                Sube tu Excel y recibe diagnósticos financieros estratégicos al instante.
                Mejora tu liquidez y rentabilidad con inteligencia de mercado.
            </p>

            <div className="flex gap-4 items-center mt-4">
                <button
                    onClick={handleStartAnalysis}
                    className="group relative px-8 py-4 rounded-full bg-primary hover:bg-indigo-600 text-white font-semibold transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] cursor-pointer z-50"
                >
                    <span className="flex items-center gap-2">
                        Comenzar Análisis
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                </button>
                <button className="px-8 py-4 rounded-full border border-white/10 hover:bg-white/5 text-white/80 font-medium transition-all cursor-pointer z-50">
                    Ver Demo
                </button>
            </div>
        </div>
    );
}
