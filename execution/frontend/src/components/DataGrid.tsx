import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { FinancialReport } from "@/lib/types";

interface DataGridProps {
    data: FinancialReport | null;
}

export function DataGrid({ data }: DataGridProps) {
    if (!data || !data.rawRows || data.rawRows.length === 0) return null;

    const { rawRows } = data;

    return (
        <div className="rounded-md border border-white/10 bg-black/20 backdrop-blur-sm p-6 mt-6 animate-in slide-in-from-bottom-2">
            <h3 className="text-xl font-bold mb-4 text-white">Detalle de Datos Extraídos ({rawRows.length} filas)</h3>
            <div className="rounded-md border border-white/10 overflow-hidden max-h-[500px] overflow-y-auto">
                <Table>
                    <TableHeader className="bg-white/5 sticky top-0 backdrop-blur-md z-10">
                        <TableRow className="hover:bg-transparent border-white/10">
                            <TableHead className="text-gray-300 w-[100px]">Fila</TableHead>
                            <TableHead className="text-gray-300">Descripción</TableHead>
                            <TableHead className="text-right text-gray-300">Valores</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rawRows.map((row, i) => (
                            <TableRow key={i} className="hover:bg-white/5 border-white/5">
                                <TableCell className="text-gray-400 font-medium text-xs">
                                    #{row.rowNumber}
                                </TableCell>
                                <TableCell className="text-gray-200">
                                    {row.description}
                                </TableCell>
                                <TableCell className="text-right font-mono text-emerald-400">
                                    {Object.entries(row.values).map(([period, value]) => (
                                        <div key={period} className="text-xs">
                                            <span className="text-gray-400">{period}:</span> {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value)}
                                        </div>
                                    ))}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <p className="text-xs text-gray-500 mt-4">
                * Visualizando {rawRows.length} registros detectados en su archivo Excel.
            </p>
        </div>
    );
}
