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
    // 1. Calculate Valid Indices (columns that are not empty across all rows)
    // We assume the first column (index 0) is always valid/important (Names/Labels)
    const validIndices = React.useMemo(() => {
        if (!data || data.length === 0) return headers.map((_, i) => i);

        // Heuristic: Scan meaningful rows. 
        // We scan ALL rows, but require at least ONE non-empty value.
        // To be safer against "Title Rows" spanning empty columns (which might look like data but are just one-offs),
        // we could require > 1 value if rows > 10? 
        // For now, let's Stick to "Has ANY data" but rely on CSS to shrink empty-ish columns.
        const indices = new Set<number>();
        indices.add(0); // Always keep the first column

        for (let colIndex = 1; colIndex < headers.length; colIndex++) {
            // Check headers too? Sometimes headers have text but no data.
            // Let's check headers + data.
            const headerHasContent = headers[colIndex] && String(headers[colIndex]).trim() !== '';

            const dataHasContent = data.some(row => {
                const cell = row[colIndex];
                return cell !== undefined && cell !== null && String(cell).trim() !== '';
            });

            if (headerHasContent || dataHasContent) {
                indices.add(colIndex);
            }
        }
        return Array.from(indices).sort((a, b) => a - b);
    }, [data, headers]);

    // ... filteredHeaders / filteredData logic remains ...
    const filteredHeaders = React.useMemo(() => {
        return validIndices.map(i => headers[i]);
    }, [headers, validIndices]);

    const filteredData = React.useMemo(() => {
        return data.map(row => validIndices.map(i => row[i]));
    }, [data, validIndices]);

    return (
        <div className={cn("relative w-full h-full bg-[#0f1014]", className)}>
            {/* 
                Use native scroll behavior. 
                'overscroll-none' prevents parent page scroll hijacking.
            */}
            <div className="w-full h-full overflow-auto relative overscroll-none scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                <table className="w-max text-[10px] text-left border-separate border-spacing-0 text-gray-300">
                    <thead className="bg-[#0f1014] text-gray-200 font-bold sticky top-0 z-30">
                        <tr>
                            {filteredHeaders.map((header, i) => (
                                <th
                                    key={i}
                                    className={cn(
                                        "px-3 py-2 border-b border-white/10 border-r border-white/5 last:border-r-0 whitespace-nowrap bg-[#1a1b20]",
                                        // Sticky first column
                                        i === 0 && "sticky left-0 z-40 bg-[#1a1b20] border-r border-white/20 shadow-[2px_0_5px_rgba(0,0,0,0.4)]"
                                    )}
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredData.map((row, i) => (
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
                                            // Removing min-w-[120px] is CRITICAL to fixing the 'Gap' issue.
                                            // 'whitespace-nowrap' ensures content isn't squashed.
                                            // 'w-auto' allows the browser to decide.
                                            "px-3 py-1.5 border-r border-white/5 last:border-r-0 whitespace-nowrap min-w-[100px]",
                                            // Sticky first column styling
                                            j === 0 && "min-w-[180px] sticky left-0 z-20 bg-[#0f1014] font-medium text-gray-200 group-hover:bg-inherit border-r border-white/20 shadow-[2px_0_5px_rgba(0,0,0,0.4)]"
                                        )}
                                    >
                                        {renderCell ? renderCell(cell, j, row, i) : cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredData.length === 0 && (
                    <div className="h-40 flex items-center justify-center text-gray-500 text-sm">
                        No hay datos para mostrar
                    </div>
                )}
            </div>
        </div>
    )
}
