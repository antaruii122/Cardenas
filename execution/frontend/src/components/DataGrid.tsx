import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ParsingResult } from "@/lib/types";

interface DataGridProps {
    data: ParsingResult | null;
}

export function DataGrid({ data }: DataGridProps) {
    if (!data || !data.success || !data.data) return null;

    const { pnl } = data.data;

    const rows = [
        { label: "Ingresos de Explotación", value: pnl.revenue },
        { label: "Costo de Ventas", value: pnl.cogs },
        { label: "Margen Bruto", value: pnl.grossProfit, highlight: true },
        { label: "Gastos de Adm. y Ventas", value: pnl.opEx },
        { label: "Resultado Operacional", value: pnl.operatingProfit, highlight: true },
        { label: "Otros Ingresos", value: pnl.otherIncome },
        { label: "Otros Gastos", value: pnl.otherExpenses },
        { label: "Gastos Financieros", value: pnl.interestExpense },
        { label: "Impuestos", value: pnl.taxes },
        { label: "Depreciación", value: pnl.depreciation },
        { label: "Amortización", value: pnl.amortization },
        { label: "Utilidad Neta", value: pnl.netIncome, highlight: true },
    ];

    return (
        <div className="rounded-md border border-white/10 bg-black/20 backdrop-blur-sm p-6 mt-6">
            <h3 className="text-xl font-bold mb-4 text-white">Detalle de Datos Extraídos</h3>
            <div className="rounded-md border border-white/10 overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="hover:bg-transparent border-white/10">
                            <TableHead className="text-gray-300">Concepto</TableHead>
                            <TableHead className="text-right text-gray-300">Valor (CLP)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.label} className="hover:bg-white/5 border-white/5">
                                <TableCell className={`font-medium ${row.highlight ? 'text-blue-400' : 'text-gray-200'}`}>
                                    {row.label}
                                </TableCell>
                                <TableCell className="text-right text-gray-200 font-mono">
                                    {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(row.value)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <p className="text-xs text-gray-500 mt-4">
                * Estos datos han sido extraídos automáticamente de su archivo Excel.
            </p>
        </div>
    );
}
