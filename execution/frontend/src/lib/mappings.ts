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
        "total ventas",
        "ingresos ordinarios" // Added for user
    ],
    cogs: [
        "costo de ventas",
        "costo de venta",
        "costo de explotación",
        "costo de mercadería vendida",
        "cmv",
        "costos directos",
        "costo directo",
        "costos operacionales" // Added for user
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
        "utilidad neta", // Standard
        "resultado del ejercicio", // Common in Chile
        "ganancia neta",
        "pérdida neta",
        "resultado final",
        "utilidad (pérdida) del ejercicio",
        "utilidad del ejercicio",
        "ganancia (pérdida) del periodo",
        "resultado del periodo",
        "resultado neto",
        "utilidad del año", // Added for user
        "ganancia del año"
    ],
    otherIncome: [
        "otros ingresos",
        "ingresos financieros",
        "diferencias de cambio",
        "otros egresos", // Map mixed fields here for now
        "ingresos no operacionales"
    ],
    taxes: [
        "impuesto a las ganancias",
        "impuesto a la renta",
        "gasto por impuesto",
        "ingreso por impuesto"
    ]
};

// Broad Category Mappings (Column A triggers)
export const CATEGORY_MAPPINGS: Record<string, string[]> = {
    revenue: ["ingresos"],
    cogs: ["costos", "costo", "costos (cogs)"],
    opEx: ["gastos", "gastos oper.", "gastos operativos", "gastos de administración"],
    other: ["no operacionales", "otros"]
};

export const IGNORED_TERMS = [
    "total", // Often redundant if not specific
    "suma"
];
