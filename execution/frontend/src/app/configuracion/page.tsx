export default function ConfiguracionPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
                    Configuración
                </h1>
                <p className="text-gray-400 mt-2">Administra tu cuenta y preferencias.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl">
                    <h2 className="text-xl font-semibold text-white mb-4">Plan Actual</h2>
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <div className="text-sm text-blue-400 font-medium">PYME Pro</div>
                        <div className="text-2xl font-bold text-white mt-1">$49.990 <span className="text-sm font-normal text-gray-400">/ mes</span></div>
                    </div>
                    <button className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition text-sm font-medium">
                        Gestionar Suscripción
                    </button>
                </div>

                <div className="p-6 rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl">
                    <h2 className="text-xl font-semibold text-white mb-4">Preferencias</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-300">Modo Oscuro</span>
                            <div className="w-10 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-300">Notificaciones</span>
                            <div className="w-10 h-6 bg-white/10 rounded-full relative cursor-pointer">
                                <div className="absolute left-1 top-1 w-4 h-4 bg-gray-400 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
