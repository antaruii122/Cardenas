'use client'

import { useState } from 'react'
import { Upload, FileUp, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import * as XLSX from 'xlsx'

export default function FinancialUpload() {
    const [uploading, setUploading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'review' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')

    // State for File Review
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [sheetNames, setSheetNames] = useState<string[]>([])
    const [sheetPreviews, setSheetPreviews] = useState<Record<string, string>>({})
    const [selectedSheets, setSelectedSheets] = useState<Record<string, 'Import' | 'Skip'>>({})
    const [activeTab, setActiveTab] = useState<string>('')

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setSelectedFile(file)
        setUploading(true) // Show loading while parsing
        setMessage('Analizando archivo...')

        try {
            const data = await file.arrayBuffer()
            const workbook = XLSX.read(data)

            const sheets = workbook.SheetNames
            setSheetNames(sheets)

            // Generate previews for all sheets 
            const previews: Record<string, string> = {}
            const initialSelection: Record<string, 'Import' | 'Skip'> = {}

            sheets.forEach(sheet => {
                const ws = workbook.Sheets[sheet]

                // Pre-process cells to format numbers cleanly
                // SheetJS uses the 'w' (formatted text) field for HTML output if present.
                // We will forcefully format all numbers to avoid long decimals.
                const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
                for (let R = range.s.r; R <= range.e.r; ++R) {
                    for (let C = range.s.c; C <= range.e.c; ++C) {
                        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                        const cell = ws[cellAddress];

                        // If cell is a number type ('n') and has a raw value ('v')
                        if (cell && cell.t === 'n' && typeof cell.v === 'number') {
                            // Format logic: 
                            // If it looks like an integer, show no decimals.
                            // If it has decimals, show 2 max.
                            // Uses Intl.NumberFormat for nice comma grouping "1,000,000"
                            cell.w = new Intl.NumberFormat('es-CL', {
                                maximumFractionDigits: 2,
                                minimumFractionDigits: 0
                            }).format(cell.v);

                            // Important: sheet_to_html prefers 'w' if it exists.
                        }
                    }
                }

                // Parse as HTML with the new formatted values
                const html = XLSX.utils.sheet_to_html(ws, { id: 'excel-preview-table', editable: false })
                previews[sheet] = html as any
                initialSelection[sheet] = 'Skip'
            })

            setSheetPreviews(previews)
            setSelectedSheets(initialSelection)
            if (sheets.length > 0) setActiveTab(sheets[0])

            setStatus('review')
            setUploading(false)

        } catch (error) {
            console.error(error)
            setStatus('error')
            setMessage('Error al leer el archivo Excel')
            setUploading(false)
        }
    }

    const toggleSheetAction = (sheet: string, action: 'Import' | 'Skip') => {
        setSelectedSheets(prev => ({
            ...prev,
            [sheet]: action
        }))
    }

    const handleFinalizeUpload = async () => {
        if (!selectedFile) return

        const sheetsToImport = Object.entries(selectedSheets)
            .filter(([_, action]) => action === 'Import')
            .map(([sheet]) => sheet)

        if (sheetsToImport.length === 0) {
            alert('Por favor selecciona al menos una hoja para importar.')
            return
        }

        setUploading(true)
        setMessage('Subiendo datos seleccionados...')

        try {
            const supabase = createClient()
            const fileName = `${Date.now()}_${selectedFile.name}`

            // 1. Upload to Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('financial_documents')
                .upload(fileName, selectedFile)

            if (uploadError) throw uploadError

            // 2. Insert into DB with Metadata about selected sheets
            const { error: dbError } = await supabase
                .from('financial_records')
                .insert({
                    file_name: selectedFile.name,
                    file_url: uploadData?.path,
                    source_type: selectedFile.name.endsWith('.pdf') ? 'PDF' : 'EXCEL',
                    status: 'PENDING',
                    // Store the selected sheets in a metadata column if it exists, 
                    // or currently we just log it. Ideally user's DB should support this.
                    // For now, we assume the backend will process the file. 
                    // NOTE: To strictly enforce "only import selected", the backend parser 
                    // must read this metadata. I'm adding it as a JSON 'metadata' field 
                    // assuming the schema supports it or is flexible (jsonb).
                    metadata: {
                        sheets_to_process: sheetsToImport
                    }
                })

            if (dbError) throw dbError

            setStatus('success')
            setMessage('¡Archivo subido y procesado correctamente!')
            // Reset after delay or keep success state

        } catch (error: any) {
            console.error(error)
            setStatus('error')
            setMessage(error.message || 'Error al subir el archivo')
        } finally {
            setUploading(false)
        }
    }

    if (status === 'review') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                <div className="w-full max-w-6xl h-[85vh] bg-[#0f1014] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                                <FileUp className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Revisar Importación</h3>
                                <p className="text-xs text-gray-400 font-mono">{selectedFile?.name}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => { setStatus('idle'); setSelectedFile(null); }}
                            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        >
                            <span className="sr-only">Cerrar</span>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex overflow-hidden">

                        {/* Sidebar: Sheets */}
                        <div className="w-1/3 max-w-xs border-r border-white/10 bg-black/20 flex flex-col">
                            <div className="p-4 border-b border-white/5">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Hojas Detectadas ({sheetNames.length})</p>
                            </div>
                            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                                {sheetNames.map(sheet => {
                                    const action = selectedSheets[sheet];
                                    const isActive = activeTab === sheet;
                                    return (
                                        <div
                                            key={sheet}
                                            onClick={() => setActiveTab(sheet)}
                                            className={`
                                                group p-3 rounded-xl border cursor-pointer transition-all duration-200 relative overflow-hidden
                                                ${isActive
                                                    ? 'bg-white/5 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                                    : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'}
                                            `}
                                        >
                                            <div className="flex justify-between items-center mb-3 relative z-10">
                                                <span className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                                                    {sheet}
                                                </span>
                                                {action === 'Import' && (
                                                    <div className="bg-emerald-500/10 p-1 rounded-full">
                                                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Segmented Control for Action */}
                                            <div className="flex bg-black/40 rounded-lg p-1 relative z-10">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleSheetAction(sheet, 'Skip'); }}
                                                    className={`
                                                        flex-1 text-[10px] py-1.5 rounded-md font-medium transition-all duration-200
                                                        ${action === 'Skip'
                                                            ? 'bg-rose-500/10 text-rose-400 shadow-sm'
                                                            : 'text-gray-600 hover:text-gray-400'}
                                                    `}
                                                >
                                                    Omitir
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleSheetAction(sheet, 'Import'); }}
                                                    className={`
                                                        flex-1 text-[10px] py-1.5 rounded-md font-medium transition-all duration-200
                                                        ${action === 'Import'
                                                            ? 'bg-emerald-500/10 text-emerald-400 shadow-sm'
                                                            : 'text-gray-600 hover:text-gray-400'}
                                                    `}
                                                >
                                                    Importar
                                                </button>
                                            </div>

                                            {/* Active Indicator Bar */}
                                            {isActive && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-cyan-500" />
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Main Preview Area */}
                        <div className="flex-1 flex flex-col bg-[#0f1014] relative">
                            {/* Toolbar */}
                            <div className="h-12 border-b border-white/10 flex items-center justify-between px-6 bg-white/5">
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <span className="opacity-50">Vista Previa:</span>
                                    <span className="text-white font-medium">{activeTab}</span>
                                </div>
                                <div className={`px-2 py-0.5 rounded text-xs border font-medium uppercase tracking-wider ${selectedSheets[activeTab] === 'Import'
                                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                                    : 'bg-rose-500/5 border-rose-500/20 text-rose-400'
                                    }`}>
                                    {selectedSheets[activeTab] === 'Import' ? 'Se Importará' : 'Se Omitirá'}
                                </div>
                            </div>

                            {/* HTML Preview */}
                            <div className="flex-1 overflow-auto custom-scrollbar p-6 bg-[#0f1014] relative">
                                {/* Inject Custom Styles for Excel Table */}
                                <style jsx global>{`
                                    #excel-preview-table {
                                        width: 100%;
                                        border-collapse: collapse;
                                        font-family: 'Inter', sans-serif;
                                        font-size: 12px;
                                        color: #9ca3af;
                                    }
                                    #excel-preview-table td, #excel-preview-table th {
                                        border: 1px solid rgba(255,255,255,0.1);
                                        padding: 8px 12px;
                                        white-space: nowrap;
                                    }
                                    #excel-preview-table tr:first-child td {
                                        font-weight: bold;
                                        color: #e5e7eb;
                                        background-color: rgba(255,255,255,0.05);
                                        position: sticky;
                                        top: 0;
                                        z-index: 10;
                                    }
                                    #excel-preview-table tr:hover td {
                                        background-color: rgba(255,255,255,0.02);
                                    }
                                `}</style>

                                {sheetPreviews[activeTab] ? (
                                    <div
                                        className="excel-preview-content"
                                        dangerouslySetInnerHTML={{ __html: sheetPreviews[activeTab] as unknown as string }}
                                    />
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4 opacity-50 bg-[#0f1014]">
                                        <div className="p-4 rounded-full bg-white/5">
                                            <FileUp className="w-8 h-8" />
                                        </div>
                                        <p>No se encontraron datos en esta hoja</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-white/10 bg-white/5 flex justify-between items-center">
                        <div className="px-4 text-sm text-gray-400">
                            <span className="text-emerald-400 font-bold">{Object.values(selectedSheets).filter(s => s === 'Import').length}</span> hojas seleccionadas para importar
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setStatus('idle'); setSelectedFile(null); }}
                                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleFinalizeUpload}
                                disabled={uploading}
                                className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        Finalizar Importación
                                        <Upload className="w-4 h-4 ml-1" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-md p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
            <div className="flex flex-col items-center justify-center space-y-6">
                <div className="p-4 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500 shadow-lg">
                    <Upload className="w-8 h-8 text-white" />
                </div>

                <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-white tracking-tight">Cargar Estado de Resultados</h3>
                    <p className="text-sm text-gray-300">Arrastra tu Excel o PDF aquí para analizar</p>
                </div>

                <div className="w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/30 rounded-xl cursor-pointer hover:bg-white/5 transition-all group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {uploading ? (
                                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                            ) : (
                                <FileUp className="w-8 h-8 text-gray-400 group-hover:text-white transition-colors" />
                            )}
                        </div>
                        <input
                            type="file"
                            className="hidden"
                            onChange={handleFileSelect}
                            accept=".xlsx,.xls,.csv,.pdf"
                            disabled={uploading}
                        />
                    </label>
                </div>

                {status === 'success' && (
                    <div className="flex items-center space-x-2 text-emerald-400 animate-in fade-in slide-in-from-bottom-2">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">{message}</span>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex items-center space-x-2 text-rose-400 animate-in fade-in slide-in-from-bottom-2">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">{message}</span>
                    </div>
                )}
            </div>
        </div>
    )
}
