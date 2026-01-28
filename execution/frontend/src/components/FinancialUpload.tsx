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
    const [sheetPreviews, setSheetPreviews] = useState<Record<string, any[]>>({})
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

            // Generate previews for all sheets (first 5 rows)
            const previews: Record<string, any[]> = {}
            const initialSelection: Record<string, 'Import' | 'Skip'> = {}

            sheets.forEach(sheet => {
                const ws = workbook.Sheets[sheet]
                // Parse a small preview
                const json = XLSX.utils.sheet_to_json(ws, { header: 1, range: 0, defval: '' })
                previews[sheet] = json.slice(0, 6) // Header + 5 rows
                initialSelection[sheet] = 'Skip' // Default to Skip
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
            <div className="w-full max-w-4xl p-8 rounded-2xl bg-[#0B0F17] border border-white/10 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-white">Revisar Archivo</h3>
                        <p className="text-gray-400 text-sm">{selectedFile?.name}</p>
                    </div>
                    <button
                        onClick={() => { setStatus('idle'); setSelectedFile(null); }}
                        className="text-gray-500 hover:text-white"
                    >
                        Cancelar
                    </button>
                </div>

                <div className="grid grid-cols-12 gap-6">
                    {/* Sidebar: Sheet List */}
                    <div className="col-span-4 space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Hojas Detectadas</p>
                        {sheetNames.map(sheet => (
                            <div
                                key={sheet}
                                onClick={() => setActiveTab(sheet)}
                                className={`
                                    group p-3 rounded-lg border cursor-pointer transition-all duration-200
                                    ${activeTab === sheet
                                        ? 'bg-emerald-500/10 border-emerald-500/50'
                                        : 'bg-white/5 border-white/5 hover:bg-white/10'}
                                `}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`text-sm font-medium ${activeTab === sheet ? 'text-emerald-400' : 'text-gray-300'}`}>
                                        {sheet}
                                    </span>
                                    {selectedSheets[sheet] === 'Import' && (
                                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                                    )}
                                </div>

                                {/* Action Toggles */}
                                <div className="flex bg-black/40 rounded-md p-0.5">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleSheetAction(sheet, 'Skip'); }}
                                        className={`flex-1 text-[10px] py-1 rounded-sm transition-colors ${selectedSheets[sheet] === 'Skip' ? 'bg-rose-500/20 text-rose-400' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        Omitir
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleSheetAction(sheet, 'Import'); }}
                                        className={`flex-1 text-[10px] py-1 rounded-sm transition-colors ${selectedSheets[sheet] === 'Import' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        Importar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Main Area: Preview */}
                    <div className="col-span-8 bg-white/5 rounded-xl border border-white/10 p-4 min-h-[400px] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                                <FileUp className="w-4 h-4 text-emerald-400" />
                                Vista Previa: {activeTab}
                            </h4>
                            <span className={`px-2 py-0.5 rounded text-xs border ${selectedSheets[activeTab] === 'Import'
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                                }`}>
                                Estado: {selectedSheets[activeTab] === 'Import' ? 'Importar' : 'Omitir'}
                            </span>
                        </div>

                        <div className="flex-1 overflow-auto custom-scrollbar border border-white/5 rounded-lg bg-black/20">
                            {sheetPreviews[activeTab]?.length > 0 ? (
                                <table className="w-full text-xs text-left text-gray-400">
                                    <thead className="bg-white/5 text-gray-200">
                                        <tr>
                                            {sheetPreviews[activeTab][0].map((header: any, i: number) => (
                                                <th key={i} className="px-3 py-2 font-medium whitespace-nowrap border-b border-white/10">
                                                    {header || `Col ${i + 1}`}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sheetPreviews[activeTab].slice(1).map((row: any[], i: number) => (
                                            <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                                                {row.map((cell: any, j: number) => (
                                                    <td key={j} className="px-3 py-2 whitespace-nowrap">
                                                        {cell}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    Hoja vacía o sin datos detectados
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3 pt-6 border-t border-white/10">
                    <button
                        onClick={() => { setStatus('idle'); setSelectedFile(null); }}
                        className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleFinalizeUpload}
                        disabled={uploading}
                        className="px-6 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Procesando...
                            </>
                        ) : (
                            <>
                                Finalizar Importación
                            </>
                        )}
                    </button>
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
