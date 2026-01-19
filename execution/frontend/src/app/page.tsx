import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, PieChart, UploadCloud, TrendingUp, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 sm:p-20 font-[family-name:var(--font-geist-sans)] relative overflow-hidden">

      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-50">
        <div className="absolute top-[-10%] left-[20%] w-[300px] h-[300px] bg-primary/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-10%] right-[20%] w-[300px] h-[300px] bg-success/10 rounded-full blur-[80px]" />
      </div>

      <main className="max-w-6xl w-full flex flex-col gap-16 items-center z-10">

        {/* Hero Section */}
        <div className="text-center flex flex-col items-center gap-6 mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
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
            <button className="group relative px-8 py-4 rounded-full bg-primary hover:bg-indigo-600 text-white font-semibold transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)]">
              <span className="flex items-center gap-2">
                Comenzar Análisis
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button className="px-8 py-4 rounded-full border border-white/10 hover:bg-white/5 text-white/80 font-medium transition-all">
              Ver Demo
            </button>
          </div>
        </div>

        {/* Feature Grid (Glassmorphism) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-12">
          <FeatureCard
            icon={<UploadCloud className="w-6 h-6 text-primary" />}
            title="Carga Simple"
            description="Arrastra tu Excel. Nuestro motor normaliza tus datos contables automáticamente."
          />
          <FeatureCard
            icon={<PieChart className="w-6 h-6 text-success" />}
            title="Análisis Visual"
            description="Dashboards interactivos que transforman filas de números en insights claros."
          />
          <FeatureCard
            icon={<TrendingUp className="w-6 h-6 text-warning" />}
            title="Mejoramientos"
            description="Recibe acciones concretas para mejorar márgenes y salud financiera."
          />
        </div>

      </main>

      <footer className="mt-32 text-center text-white/30 text-sm">
        <p>&copy; 2026 Antigravity Financial Tools. Built for ambitious PYMEs.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 hover:bg-white/5 transition-colors cursor-default group">
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white/90 mb-2">{title}</h3>
        <p className="text-sm text-white/50 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
