"use client"

import { FinancialReport } from "@/lib/types";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

interface FinancialChartsProps {
    data: FinancialReport | null;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ec4899'];

export function FinancialCharts({ data }: FinancialChartsProps) {
    if (!data || !data.statements || data.statements.length === 0) return null;

    // Use the most recent period for charts
    const sortedStatements = [...data.statements].sort((a, b) =>
        a.metadata.period.localeCompare(b.metadata.period)
    );
    const currentStatement = sortedStatements[sortedStatements.length - 1];
    const { pnl } = currentStatement;

    // Data for Bar Chart: Margins
    const marginData = [
        { name: 'Margen Bruto', value: pnl.grossProfit },
        { name: 'Res. Operacional', value: pnl.operatingProfit },
        { name: 'Utilidad Neta', value: pnl.netIncome },
    ];

    // Data for Pie Chart: Costs breakdown (Simplified)
    const costData = [
        { name: 'Costo Ventas', value: pnl.cogs },
        { name: 'Gastos Adm/Ventas', value: pnl.opEx },
        { name: 'Impuestos', value: pnl.taxes },
    ].filter(d => d.value > 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-black/20 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
                <h3 className="text-white font-semibold mb-4 text-center">Resultados Clave ({currentStatement.metadata.period})</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={marginData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false}
                                tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                                itemStyle={{ color: '#f3f4f6' }}
                                formatter={(value: any) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value)}
                            />
                            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-black/20 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
                <h3 className="text-white font-semibold mb-4 text-center">Estructura de Costos</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={costData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {costData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                                itemStyle={{ color: '#f3f4f6' }}
                                formatter={(value: any) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value)}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
