"use client";

import { UploadCloud, FileSpreadsheet, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useState, useCallback } from "react";
import { parseFinancialExcel } from "@/lib/excel-parser";
import { useRouter } from "next/navigation";

export function UploadZone() {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleProcessFile = async (file: File) => {
        setIsProcessing(true);
        setError(null);

        // Artificial delay for "Scanning" effect
        await new Promise(resolve => setTimeout(resolve, 1500));

        const result = await parseFinancialExcel(file);

        if (result.success && result.report) {
            // Updated for Multi-Period Support
            localStorage.setItem("financialReport", JSON.stringify(result.report));
            router.push("/dashboard/analysis");
        } else {
            setIsProcessing(false);
            setError(result.errors[0] || "Error desconocido al procesar el archivo.");
        }
    };

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files?.[0]) {
            handleProcessFile(e.dataTransfer.files[0]);
        }
    }, []);

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div
                className={`
          relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300
          flex flex-col items-center justify-center gap-6 group cursor-pointer
          ${isDragging
                        ? "border-primary bg-primary/10 scale-[1.02] shadow-[0_0_30px_-5px_var(--color-primary)]"
                        : "border-white/10 bg-white/5 hover:bg-white/[0.07] hover:border-white/20"}
          ${error ? "border-error/50 bg-error/5" : ""}
        `}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
            >
                {isProcessing ? (
                    <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        <p className="text-white/80 font-medium">Analizando estructura financiera...</p>
                    </div>
                ) : (
                    <>
                        <div className={`
              w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300
              ${isDragging ? "bg-primary text-white" : "bg-white/10 text-white/50 group-hover:scale-110 group-hover:text-primary group-hover:bg-primary/20"}
              ${error ? "bg-error/20 text-error" : ""}
            `}>
                            {error ? <AlertCircle className="w-10 h-10" /> : <UploadCloud className="w-10 h-10" />}
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold text-white/90">
                                {error ? "Error de Lectura" : "Sube tu Estado de Resultados"}
                            </h3>
                            <p className="text-white/50 max-w-xs mx-auto text-sm">
                                {error || "Arrastra tu archivo Excel (.xlsx). Validamos Ingresos, Costos y Gastos automáticamente."}
                            </p>
                        </div>

                        {!error && (
                            <div className="flex gap-4 items-center justify-center mt-4 opacity-50 text-xs">
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                                    <FileSpreadsheet className="w-3.5 h-3.5" />
                                    <span>.XLSX</span>
                                </div>
                            </div>
                        )}

                        {/* Hidden Input for Click */}
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={(e) => e.target.files?.[0] && handleProcessFile(e.target.files[0])}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </>
                )}
            </div>
        </div>
    );
}
