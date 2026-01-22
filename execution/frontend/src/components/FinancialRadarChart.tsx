
"use client";

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';

interface Props {
    data: { subject: string; A: number; fullMark: number }[];
}

export function FinancialRadarChart({ data }: Props) {
    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Salud Financiera"
                        dataKey="A"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="#10b981"
                        fillOpacity={0.2}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#1e293b",
                            borderColor: "#334155",
                            borderRadius: "8px",
                            color: "#f8fafc",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.5)"
                        }}
                        itemStyle={{ color: "#f8fafc" }}
                        cursor={{ stroke: '#334155' }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
