import * as React from "react"
import { cn } from "@/lib/utils"

interface SmartTableProps {
    headers: any[]
    data: any[][]
    getRowClassName?: (row: any[], index: number) => string
    renderCell?: (cell: any, cellIndex: number, row: any[], rowIndex: number) => React.ReactNode
    className?: string
}

export function SmartTable({
    headers,
    data,
    getRowClassName,
    renderCell,
    className
}: SmartTableProps) {
    return (
        <div className={cn("relative w-full h-full flex flex-col bg-[#0f1014]", className)}>
            <div className="flex-1 overflow-auto relative custom-scrollbar">
                <table className="w-full text-xs text-left border-separate border-spacing-0 text-gray-300">
                    <thead className="bg-[#0f1014] text-gray-200 font-bold sticky top-0 z-30">
                        <tr>
                            {headers.map((header, i) => (
                                <th
                                    key={i}
                                    className={cn(
                                        "px-4 py-3 border-b border-white/10 border-r border-white/5 last:border-r-0 whitespace-nowrap bg-[#1a1b20]",
                                        i === 0 && "sticky left-0 z-40 bg-[#1a1b20] border-r border-white/20 shadow-[2px_0_5px_rgba(0,0,0,0.4)]"
                                    )}
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {data.map((row, i) => (
                            <tr
                                key={i}
                                className={cn(
                                    "transition-colors group",
                                    getRowClassName?.(row, i) || "hover:bg-white/5"
                                )}
                            >
                                {row.map((cell, j) => (
                                    <td
                                        key={j}
                                        className={cn(
                                            "px-4 py-2 border-r border-white/5 last:border-r-0 whitespace-nowrap min-w-[120px]",
                                            j === 0 && "sticky left-0 z-20 bg-[#0f1014] font-medium text-gray-200 group-hover:bg-inherit border-r border-white/20 shadow-[2px_0_5px_rgba(0,0,0,0.4)]"
                                        )}
                                    >
                                        {renderCell ? renderCell(cell, j, row, i) : cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {data.length === 0 && (
                    <div className="h-40 flex items-center justify-center text-gray-500 text-sm">
                        No hay datos para mostrar
                    </div>
                )}
            </div>
        </div>
    )
}
