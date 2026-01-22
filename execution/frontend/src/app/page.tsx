import Link from "next/link";
import { ArrowRight, BarChart3, PieChart, UploadCloud, TrendingUp, ShieldCheck, Activity, Zap, FileText, CheckCircle2 } from "lucide-react";
import { Hero } from "@/components/Hero";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";

export default function Home() {
  const items = [
    {
      title: "Ingesta Inteligente",
      description: "Detecta automáticamente columnas, categorías y formatos numéricos complejos (CLP, USD, UF).",
      header: <SkeletonOne />,
      icon: <UploadCloud className="h-4 w-4" />,
    },
    {
      title: "Protocolo de Reportes S.E.E.",
      description: "Cálculo automático de Solvencia, Estabilidad y Eficiencia basado en proxies IFRS.",
      header: <SkeletonTwo />,
      icon: <Activity className="h-4 w-4" />,
    },
    {
      title: "Detección de Riesgos",
      description: "Identifica fugas de margen y quema de caja antes de que amenacen la solvencia.",
      header: <SkeletonThree />,
      icon: <ShieldCheck className="h-4 w-4" />,
    },
    {
      title: "Consejería de IA",
      description: "El motor sugiere acciones concretas: 'Reducir Gastos Admin', 'Optimizar Proveedores'.",
      header: <SkeletonFour />,
      icon: <Zap className="h-4 w-4" />,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center bg-background text-foreground font-sans selection:bg-primary selection:text-black">

      <main className="w-full flex flex-col gap-24 items-center z-10 relative">

        {/* Hero Section */}
        <Hero />

        {/* TRUST SIGNALS - Minimalist */}
        <div className="w-full text-center border-y border-white/5 bg-white/[0.02] py-12">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-8">Equipos financieros que confían en nosotros</p>
            <div className="flex flex-wrap justify-center gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Minimal Text Logos */}
              <span className="text-lg font-display font-bold text-white/80">ACME CORP</span>
              <span className="text-lg font-display font-bold text-white/80">STARK IND</span>
              <span className="text-lg font-display font-bold text-white/80">WAYNE ENT</span>
              <span className="text-lg font-display font-bold text-white/80">CYBERDYNE</span>
            </div>
          </div>
        </div>

        {/* BENTO GRID FEATURES */}
        <div className="w-full max-w-7xl px-6">
          <h2 className="text-3xl md:text-5xl font-display font-medium text-center text-white mb-6">Claridad Financiera Total</h2>
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto font-light leading-relaxed">
            Nuestro motor convierte datos brutos de Excel en estrategia pura. Sin integraciones de ERP complejas.
          </p>

          <BentoGrid className="max-w-6xl mx-auto">
            {items.map((item, i) => (
              <BentoGridItem
                key={i}
                title={item.title}
                description={item.description}
                header={item.header}
                icon={item.icon}
                className={i === 3 || i === 6 ? "md:col-span-2" : ""}
              />
            ))}
          </BentoGrid>
        </div>

        {/* The 4 Pillars Section - Redesigned */}
        <div className="w-full max-w-5xl px-6 pb-32 mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
            <div className="col-span-1 md:col-span-2 text-center mb-8">
              <h2 className="text-3xl font-display text-white">¿Por qué analizar?</h2>
            </div>
            <BenefitItem
              number="01"
              title="Evaluación de Rentabilidad"
              desc="No se trata de ventas, sino de lo que te queda. Identifica márgenes reales y la viabilidad del modelo."
            />
            <BenefitItem
              number="02"
              title="Toma de Decisiones Estratégicas"
              desc="Deja de adivinar. Usa datos duros para decidir si contratar, invertir o recortar gastos."
            />
            <BenefitItem
              number="03"
              title="Detección de Riesgos"
              desc="Alerta temprana de costos crecientes o ineficiencias operativas antes de que sean críticas."
            />
            <BenefitItem
              number="04"
              title="Acceso a Capital"
              desc="Los bancos invierten en números, no en entusiasmo. Un reporte sólido es tu pasaporte al capital."
            />
          </div>
        </div>

      </main>

      <footer className="w-full py-12 border-t border-white/5 bg-black/20 text-center">
        <p className="text-sm text-muted-foreground font-mono">
          &copy; 2026 Antigravity Financial Tools. <span className="text-primary/50">Sistema v2.0</span>
        </p>
      </footer>
    </div>
  );
}

// ... Skeletons ...

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

const SkeletonOne = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 p-4 border border-white/5 relative overflow-hidden group">
    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="space-y-2">
      <div className="h-2 w-1/2 bg-white/10 rounded-full" />
      <div className="h-2 w-3/4 bg-white/10 rounded-full" />
      <div className="h-8 w-full bg-white/5 rounded-md mt-4 border border-dashed border-white/10 flex items-center justify-center text-xs text-white/30">
        Excel File.xlsx
      </div>
    </div>
  </div>
);
const SkeletonTwo = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 p-4 relative overflow-hidden group">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-20 h-20 rounded-full border-4 border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
        <div className="w-16 h-16 rounded-full border-4 border-emerald-500 flex items-center justify-center text-emerald-400 font-bold">
          A+
        </div>
      </div>
    </div>
  </div>
);
const SkeletonThree = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 p-4 group">
    <div className="w-full h-full bg-red-500/10 rounded-lg border border-red-500/20 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-red-500/20 blur-xl group-hover:blur-2xl transition-all" />
      <ShieldCheck className="text-red-400 w-10 h-10 relative z-10" />
    </div>
  </div>
);
const SkeletonFour = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 flex-col p-4 gap-2">
    <div className="h-4 w-full bg-white/10 rounded-md animate-pulse" />
    <div className="h-4 w-2/3 bg-white/10 rounded-md animate-pulse delay-75" />
    <div className="mt-auto p-2 bg-emerald-500/20 rounded-md text-xs text-emerald-400 font-mono border border-emerald-500/20">
      + $2.5M Ahorro
    </div>
  </div>
);

function BenefitItem({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="flex gap-6 items-start group">
      <div className="text-4xl font-mono text-primary/20 group-hover:text-primary/50 transition-colors">{number}</div>
      <div>
        <h3 className="text-xl font-medium font-display text-white mb-2">{title}</h3>
        <p className="text-muted-foreground leading-relaxed font-light">{desc}</p>
      </div>
    </div>
  )
}
