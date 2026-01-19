import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, PieChart, UploadCloud, TrendingUp, ShieldCheck } from "lucide-react";
import { Hero } from "@/components/Hero";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 sm:p-20 font-[family-name:var(--font-geist-sans)] relative overflow-hidden">

      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-50">
        <div className="absolute top-[-10%] left-[20%] w-[300px] h-[300px] bg-primary/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-10%] right-[20%] w-[300px] h-[300px] bg-success/10 rounded-full blur-[80px]" />
      </div>

      <main className="max-w-6xl w-full flex flex-col gap-16 items-center z-10 relative">

        {/* Hero Section */}
        <Hero />

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

        {/* New Section: The 4 Pillars of Financial Analysis */}
        <div className="w-full mt-24">
          <h2 className="text-3xl font-bold text-center text-white mb-16">
            ¿Por qué analizar tu Estado de Resultados?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <BenefitItem
              number="01"
              title="Evaluación de Rentabilidad"
              desc="No se trata de cuánto vendes, sino de cuánto te queda. Identifica tus márgenes reales y la viabilidad de tu modelo."
            />
            <BenefitItem
              number="02"
              title="Decisiones Estratégicas"
              desc="Deja de adivinar. Usa datos duros para decidir si contratar, invertir o recortar gastos."
            />
            <BenefitItem
              number="03"
              title="Detección de Riesgos"
              desc="Alerta temprana de costos crecientes o ineficiencias operativas antes de que sean críticas."
            />
            <BenefitItem
              number="04"
              title="Acceso a Financiamiento"
              desc="Los bancos invierten en números, no en entusiasmo. Un reporte sólido es tu pasaporte al capital."
            />
          </div>
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

function BenefitItem({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="flex gap-6 items-start">
      <div className="text-4xl font-black text-white/10 font-mono">{number}</div>
      <div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-white/60 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}
