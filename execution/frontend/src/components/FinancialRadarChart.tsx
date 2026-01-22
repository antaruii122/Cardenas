
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
                    <PolarGrid stroke="#e5e5e5" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#737373', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Company Health"
                        dataKey="A"
                        stroke="#0a0a0a"
                        strokeWidth={2}
                        fill="#0a0a0a"
                        fillOpacity={0.1}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid #e5e5e5",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                        }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
