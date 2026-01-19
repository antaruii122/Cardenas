// Mapping Rules for Schema Normalization
// Keys match the FinancialStatement.pnl structure
export const PNL_MAPPINGS: Record<string, string[]> = {
    revenue: [
        "ventas",
        "ventas netas",
        "ingresos",
        "ingresos de explotación",
        "ingresos operacionales",
        "facturación",
        "total ingresos",
        "total ventas"
    ],
    cogs: [
        "costo de ventas",
        "costo de venta",
        "costo de explotación",
        "costo de mercadería vendida",
        "cmv",
        "costos directos",
        "costo directo"
    ],
    grossProfit: [
        "utilidad bruta",
        "ganancia bruta",
        "margen bruto",
        "resultado bruto"
    ],
    opEx: [
        "gastos de administración y ventas",
        "gastos de administración",
        "gastos generales",
        "gastos operacionales",
        "sg&a",
        "g.a.v."
    ],
    operatingProfit: [
        "utilidad operativa",
        "resultado operacional",
        "utilidad operacional",
        "resultado operativo",
        "ebit" // Sometimes confused, but maps to Operating Profit usually
    ],
    netIncome: [
        "utilidad neta",
        "resultado del ejercicio",
        "ganancia neta",
        "pérdida neta",
        "resultado final",
        "utilidad (pérdida) del ejercicio"
    ]
};

export const IGNORED_TERMS = [
    "total", // Often redundant if not specific
    "suma"
];
