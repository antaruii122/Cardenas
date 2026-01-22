"use client";
import Link from "next/link";
import { ArrowRight, Terminal } from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
    return (
        <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-background bg-grain selection:bg-primary selection:text-black">

            {/* Ambient Lighting - Deep, Mysterious */}
            <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] bg-primary/10 blur-[150px] rounded-full opacity-30 pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vh] bg-accent/20 blur-[120px] rounded-full opacity-20 pointer-events-none" />

            {/* Grid Horizon Effect */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

            <div className="z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center">

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-none border border-primary/30 bg-primary/5 backdrop-blur-md mb-8"
                >
                    <span className="w-1.5 h-1.5 bg-primary rounded-none animate-pulse" />
                    <span className="text-xs font-mono uppercase tracking-[0.2em] text-primary">Sistema v2.0 Operativo</span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-display text-5xl md:text-8xl font-medium tracking-tight text-white mb-6 leading-[1.1]"
                >
                    Inteligencia Financiera <br />
                    <span className="italic text-white/50">Sin Compromisos.</span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 font-light leading-relaxed"
                >
                    Convierte tu Estado de Resultados en un motor de decisiones estratégicas.
                    <br className="hidden md:block" />
                    Sin adivinanzas. Solo matemática rigurosa y claridad total.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="flex flex-col sm:flex-row gap-6 items-center"
                >
                    <Link
                        href="/dashboard"
                        className="group relative h-12 px-8 flex items-center bg-primary text-black hover:bg-white transition-colors duration-300 font-medium tracking-wide"
                    >
                        <span>Comenzar Análisis</span>
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <button className="h-12 px-8 flex items-center border border-white/20 text-white hover:bg-white/5 transition-colors duration-300 font-medium tracking-wide">
                        <Terminal className="mr-2 w-4 h-4 text-muted-foreground" />
                        <span>Ver Protocolo</span>
                    </button>
                </motion.div>
            </div>

            {/* Abstract Decorative Element (The "Monolith") */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                transition={{ duration: 1.5, delay: 1, ease: "circOut" }}
                className="absolute bottom-[-20%] w-full max-w-6xl mx-auto h-[400px] border-t border-l border-r border-white/10 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-[2px] rounded-t-[100px] md:rounded-t-[300px] opacity-40 -z-10"
            />
        </section>
    );
}
