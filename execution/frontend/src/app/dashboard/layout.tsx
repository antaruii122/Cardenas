import Link from "next/link";
import { BarChart3, FileText, Home, PieChart, Settings } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Sidebar - Glassmorphism */}
            <aside className="w-64 border-r border-white/10 bg-card backdrop-blur-xl hidden md:flex flex-col fixed h-full z-50">
                <div className="p-6">
                    <h2 className="text-xl font-bold tracking-tight text-white/90 flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-xs">AG</span>
                        Antigravity
                    </h2>
                </div>

                <nav className="flex-1 px-4 flex flex-col gap-2 mt-4">
                    <NavItem href="/dashboard" icon={<Home size={20} />} label="General" active />
                    <NavItem href="/dashboard/analysis" icon={<BarChart3 size={20} />} label="Análisis Financiero" />
                    <NavItem href="/dashboard/reports" icon={<FileText size={20} />} label="Reportes SII" />
                    <NavItem href="/dashboard/improvements" icon={<PieChart size={20} />} label="Mejoramientos" />
                </nav>

                <div className="p-4 mt-auto border-t border-white/10">
                    <NavItem href="/dashboard/settings" icon={<Settings size={20} />} label="Configuración" />
                    <div className="mt-4 px-4 py-3 rounded-lg bg-white/5 border border-white/5">
                        <p className="text-xs text-white/50">Plan Actual</p>
                        <p className="text-sm font-medium text-white/90">PYME Pro</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 relative bg-gradient-to-br from-background to-slate-900/50">
                {/* Top Navbar Mobile only */}
                <header className="md:hidden h-16 border-b border-white/10 flex items-center px-4 backdrop-blur-md sticky top-0 z-40">
                    <span className="font-bold">Antigravity Finance</span>
                </header>

                <div className="p-6 sm:p-10 max-w-7xl mx-auto animate-in fade-in duration-500">
                    {children}
                </div>
            </main>
        </div>
    );
}

function NavItem({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_-5px_var(--color-primary)]"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
        >
            {icon}
            {label}
        </Link>
    );
}
