import { UploadZone } from "@/components/UploadZone";

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-white/90">Panel General</h1>
                <p className="text-white/50">Bienvenido de vuelta. Comencemos analizando tus últimos datos.</p>
            </div>

            {/* Main Action Area */}
            <div className="glass-panel rounded-3xl p-1 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden">

                {/* Gradient grid background */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

                <div className="relative z-10 w-full py-12">
                    <UploadZone />
                </div>
            </div>

            {/* Recent Activity / Empty State */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60 pointer-events-none grayscale">
                <div className="glass-panel p-6 rounded-2xl h-48 border-dashed border-2 border-white/10 flex items-center justify-center">
                    <span className="text-white/30">Gráficos de Tendencias (Requiere Datos)</span>
                </div>
                <div className="glass-panel p-6 rounded-2xl h-48 border-dashed border-2 border-white/10 flex items-center justify-center">
                    <span className="text-white/30">Alertas Recientes (Requiere Datos)</span>
                </div>
            </div>
        </div>
    );
}
