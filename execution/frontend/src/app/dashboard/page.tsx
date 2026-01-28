'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import FinancialUpload from '@/components/FinancialUpload'
import { TrendingUp, Wallet, Activity, ArrowUpRight } from 'lucide-react'

// Types for our Analysis Payload
interface AnalysisPayload {
    kpis: {
        ratios: {
            gross_margin_pct: number
            net_margin_pct: number
        }
        total_sales: number
        net_income: number
    }
    improvements: {
        title: string
        message: string
        severity: string
    }[]
}

interface FinancialRecord {
    id: string
    status: string
    file_name: string
    analysis_payload: AnalysisPayload | null
    created_at: string
}

export default function Dashboard() {
    const [records, setRecords] = useState<FinancialRecord[]>([])
    const supabase = createClient()

    useEffect(() => {
        // Initial fetch
        const fetchRecords = async () => {
            const { data } = await supabase
                .from('financial_records')
                .select('*')
                .order('created_at', { ascending: false })

            if (data) setRecords(data)
        }

        fetchRecords()

        // Real-time subscription
        const channel = supabase
            .channel('financial_records_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'financial_records' }, (payload) => {
                fetchRecords() // Refresh on any change
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const latestRecord = records[0]
    const kpis = latestRecord?.analysis_payload?.kpis
    const improvements = latestRecord?.analysis_payload?.improvements || []

    return (
        <div className="min-h-screen w-full bg-[#0f1014] text-white relative overflow-hidden font-sans selection:bg-cyan-500/30">

            {/* Background ambient glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[0%] right-[0%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-6 py-12 relative z-10">

                <header className="mb-12 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Estados Financieros
                        </h1>
                        <p className="text-gray-400 mt-2 text-lg">Inteligencia Artificial aplicada a tu contabilidad</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Upload & Recent Files */}
                    <div className="space-y-8">
                        <FinancialUpload />

                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                            <h3 className="text-lg font-semibold mb-4 text-gray-200">Historial reciente</h3>
                            <div className="space-y-3">
                                {records.slice(0, 5).map(record => (
                                    <div key={record.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group">
                                        <span className="text-sm text-gray-400 truncate w-32">{record.file_name}</span>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${record.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                record.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                                    'bg-red-500/10 text-red-400 border border-red-500/20'
                                            }`}>
                                            {record.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Dashboard & KPIs */}
                    <div className="lg:col-span-2 space-y-8">
                        {latestRecord?.status === 'COMPLETED' && kpis ? (
                            <>
                                {/* KPI Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <KPICard
                                        title="Margen Bruto"
                                        value={`${kpis.ratios.gross_margin_pct}%`}
                                        icon={<Activity className="w-5 h-5 text-indigo-400" />}
                                    />
                                    <KPICard
                                        title="Ventas Totales"
                                        value={`$${kpis.total_sales.toLocaleString('es-CL')}`}
                                        icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
                                    />
                                    <KPICard
                                        title="Utilidad Neta"
                                        value={`$${kpis.net_income.toLocaleString('es-CL')}`}
                                        icon={<Wallet className="w-5 h-5 text-cyan-400" />}
                                    />
                                </div>

                                {/* Improvements Section */}
                                <div className="p-8 rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl">
                                    <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                                        <ArrowUpRight className="text-emerald-400" />
                                        Oportunidades de Mejora
                                    </h3>

                                    <div className="grid gap-4">
                                        {improvements.length > 0 ? improvements.map((imp, idx) => (
                                            <div key={idx} className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all hover:bg-white/10">
                                                <h4 className="font-semibold text-lg text-emerald-300 mb-1">{imp.title}</h4>
                                                <p className="text-gray-300 leading-relaxed">{imp.message}</p>
                                            </div>
                                        )) : (
                                            <div className="text-gray-400 italic">No se detectaron mejoras críticas. ¡Buen trabajo!</div>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="h-full min-h-[400px] flex items-center justify-center rounded-3xl bg-white/5 border border-white/10 border-dashed">
                                <div className="text-center text-gray-500">
                                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                    <p>Selecciona o sube un archivo para ver el análisis</p>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    )
}

function KPICard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg hover:bg-white/10 transition-all group">
            <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 font-medium text-sm tracking-wide">{title}</span>
                <div className="p-2 rounded-lg bg-white/5 group-hover:scale-110 transition-transform">
                    {icon}
                </div>
            </div>
            <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
        </div>
    )
}
