'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, FileUp, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import * as XLSX from 'xlsx'
import { SmartTable } from './ui/SmartTable'
import { useApiError } from '@/hooks/useErrorHandling'
import { FileUploadError, DataProcessingError, DatabaseError } from '@/lib/errors'

export default function FinancialUpload() {
    const [uploading, setUploading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'review' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')

    // Error handling hook
    const { showError, ErrorDisplay } = useApiError()

    // State for File Review
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [sheetNames, setSheetNames] = useState<string[]>([])
    const [sheetPreviews, setSheetPreviews] = useState<Record<string, any[][]>>({})
    const [selectedSheets, setSelectedSheets] = useState<Record<string, 'Import' | 'Skip'>>({})
    const [activeTab, setActiveTab] = useState<string>('')

    // Debug mode (Ctrl+Shift+D to toggle)
    const [debugMode, setDebugMode] = useState(false)
    const modalRef = useRef<HTMLDivElement>(null)
    const tableContainerRef = useRef<HTMLDivElement>(null)

    // Keyboard shortcut for debug mode
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault()
                setDebugMode(prev => !prev)
                console.log('Debug Mode:', !debugMode)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [debugMode])

    // Console logging for debugging
    useEffect(() => {
        if (status === 'review' && (debugMode || process.env.NODE_ENV === 'development')) {
            setTimeout(() => {
                console.log('📊 Layout Debug Info:')
                console.log('Modal:', {
                    width: modalRef.current?.offsetWidth,
                    height: modalRef.current?.offsetHeight,
                    expectedWidth: window.innerWidth * 0.95,
                    expectedHeight: window.innerHeight * 0.90
                })
                console.log('Table Container:', {
                    width: tableContainerRef.current?.offsetWidth,
                    height: tableContainerRef.current?.offsetHeight,
                    scrollWidth: tableContainerRef.current?.scrollWidth,
                    scrollHeight: tableContainerRef.current?.scrollHeight,
                    hasHorizontalOverflow: tableContainerRef.current ? tableContainerRef.current.scrollWidth > tableContainerRef.current.offsetWidth : false,
                    hasVerticalOverflow: tableContainerRef.current ? tableContainerRef.current.scrollHeight > tableContainerRef.current.offsetHeight : false
                })
            }, 500) // Wait for layout to settle
        }
    }, [status, debugMode])

    // Helper: Excel Serial Date to JS Date
    const parseExcelDate = (serial: number) => {
        // Excel base date: Dec 30, 1899
        const utc_days = Math.floor(serial - 25569);
        const utc_value = utc_days * 86400;
        const date_info = new Date(utc_value * 1000);
        return date_info.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '');
    }

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file size (10MB max)
        const MAX_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            const error = new FileUploadError(
                'El archivo excede el tamaño máximo de 10MB',
                file.name,
                { size: file.size, maxSize: MAX_SIZE }
            );
            showError(error);
            return;
        }

        // Validate file type
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv',
            'application/pdf'
        ];
        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv|pdf)$/i)) {
            const error = new FileUploadError(
                'Tipo de archivo no válido. Por favor sube un archivo Excel, CSV o PDF',
                file.name,
                { type: file.type }
            );
            showError(error);
            return;
        }

        setSelectedFile(file)
        setUploading(true)
        setMessage('Analizando archivo...')

        try {
            const data = await file.arrayBuffer()
            const workbook = XLSX.read(data)

            const sheets = workbook.SheetNames
            if (sheets.length === 0) {
                throw new DataProcessingError(
                    'No se encontraron hojas en el archivo Excel',
                    'parse'
                );
            }

            setSheetNames(sheets)

            // Generate previews for all sheets 
            const previews: Record<string, any[][]> = {}
            const initialSelection: Record<string, 'Import' | 'Skip'> = {}

            sheets.forEach(sheet => {
                const ws = workbook.Sheets[sheet]
                // Get raw data (matrix)
                const jsonData = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: '' })

                // Smart Pre-processing
                // 1. Scan for Excel Dates in headers (first 5 rows)
                const processedData = jsonData.map((row, rIndex) => {
                    return row.map((cell: any) => {
                        // Fix Date Codes (approx > 40000 is year 2009+)
                        if (rIndex < 5 && typeof cell === 'number' && cell > 40000 && cell < 60000) {
                            return parseExcelDate(cell);
                        }
                        // Format large numbers
                        if (typeof cell === 'number') {
                            return new Intl.NumberFormat('es-CL', {
                                maximumFractionDigits: 2,
                                minimumFractionDigits: 0
                            }).format(cell);
                        }
                        return cell;
                    })
                })

                previews[sheet] = processedData
                // Default Logic: Import 'EERR' or 'Balance' automatically? 
                // For now sticking to Manual Selection as 'Skip' default default.
                initialSelection[sheet] = 'Skip'
            })

            setSheetPreviews(previews)
            setSelectedSheets(initialSelection)
            if (sheets.length > 0) setActiveTab(sheets[0])

            setStatus('review')
            setUploading(false)

        } catch (error) {
            console.error(error)

            if (error instanceof FileUploadError || error instanceof DataProcessingError) {
                showError(error);
            } else {
                const processError = new DataProcessingError(
                    'Error al leer el archivo Excel',
                    'parse',
                    { originalError: error instanceof Error ? error.message : String(error) }
                );
                showError(processError);
            }

            setStatus('error')
            setMessage('Error al procesar el archivo')
            setUploading(false)
        }
    }

    // Helper: Smart Row Styling
    const getRowStyle = (sheetName: string, row: any[]) => {
        // Join all cell text to check for keywords regardless of column position
        const rowText = row.map(cell => String(cell || '').toLowerCase()).join(' ');

        // EERR Logic
        if (sheetName.toLowerCase().includes('eerr') || sheetName.toLowerCase().includes('resultados')) {
            if (rowText.includes('margen')) return 'bg-emerald-900/20 text-emerald-200 hover:bg-emerald-900/30';
            if (rowText.includes('ebitda') || rowText.includes('utilidad') || rowText.includes('resultado')) {
                return 'bg-fuchsia-900/20 text-fuchsia-200 hover:bg-fuchsia-900/30';
            }
        }
        // Default Hover
        return 'hover:bg-white/5';
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
            const error = new DataProcessingError(
                'Por favor selecciona al menos una hoja para importar',
                'validation'
            );
            showError(error);
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

            if (uploadError) {
                throw new DatabaseError(
                    'storage upload',
                    'No se pudo subir el archivo al almacenamiento',
                    uploadError as Error,
                    { fileName }
                );
            }

            // 2. Insert into DB with Metadata
            const { error: dbError } = await supabase
                .from('financial_records')
                .insert({
                    file_name: selectedFile.name,
                    file_url: uploadData?.path,
                    source_type: selectedFile.name.endsWith('.pdf') ? 'PDF' : 'EXCEL',
                    status: 'PENDING',
                    metadata: {
                        sheets_to_process: sheetsToImport
                    }
                })

            if (dbError) {
                throw new DatabaseError(
                    'insert',
                    'No se pudo guardar el registro en la base de datos',
                    dbError as Error,
                    { fileName, sheetsToImport }
                );
            }

            setStatus('success')
            setMessage('¡Archivo subido y procesado correctamente!')

        } catch (error: any) {
            console.error(error)

            if (error instanceof DatabaseError) {
                showError(error);
            } else {
                const dbError = new DatabaseError(
                    'upload',
                    error.message || 'Error al subir el archivo',
                    error,
                    { fileName: selectedFile.name }
                );
                showError(dbError);
            }

            setStatus('error')
            setMessage('Error al subir el archivo')
        } finally {
            setUploading(false)
        }
    }

    if (status === 'review') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
                <div ref={modalRef} className="w-[95vw] h-[90vh] bg-[#0f1014] border border-white/10 rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">

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
                    <div className="flex-1 flex">

                        {/* Sidebar: Sheets */}
                        <div className="w-1/4 max-w-[280px] border-r border-white/10 bg-black/20 flex flex-col">
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

                        {/* Smart Table Preview Area */}
                        <div className="flex-1 flex flex-col bg-[#0f1014] relative text-white">
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

                            {/* Render Smart React Table */}
                            <div ref={tableContainerRef} className="flex-1 relative overflow-auto" style={{ outline: debugMode ? '2px solid lime' : 'none' }}>
                                {sheetPreviews[activeTab] && sheetPreviews[activeTab].length > 0 ? (
                                    <SmartTable
                                        headers={sheetPreviews[activeTab][0]}
                                        data={sheetPreviews[activeTab].slice(1)}
                                        getRowClassName={(row: any[]) => getRowStyle(activeTab, row)}
                                        renderCell={(cell: any) => {
                                            const cellStr = String(cell);
                                            const isNegative = cellStr.startsWith('-') || (cellStr.startsWith('(') && cellStr.endsWith(')'));
                                            return (
                                                <span className={`${isNegative ? 'text-rose-400 font-medium' : ''}`}>
                                                    {cell}
                                                </span>
                                            )
                                        }}
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

                    {/* Debug Panel */}
                    {debugMode && (
                        <div className="absolute top-4 right-4 bg-black/95 border border-lime-500 rounded-lg p-4 text-xs font-mono z-50 max-w-sm">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-lime-400 font-bold">🐛 DEBUG MODE</span>
                                <span className="text-gray-400 text-[10px]">Ctrl+Shift+D to toggle</span>
                            </div>

                            <div className="space-y-2 text-gray-300">
                                <div className="border-b border-white/10 pb-2">
                                    <div className="text-lime-400 font-bold mb-1">Modal Container:</div>
                                    <div>Width: {modalRef.current?.offsetWidth}px (expected: ~{window.innerWidth * 0.95}px)</div>
                                    <div>Height: {modalRef.current?.offsetHeight}px (expected: ~{window.innerHeight * 0.90}px)</div>
                                </div>

                                <div className="border-b border-white/10 pb-2">
                                    <div className="text-lime-400 font-bold mb-1">Table Container:</div>
                                    <div>Width: {tableContainerRef.current?.offsetWidth}px</div>
                                    <div>Height: {tableContainerRef.current?.offsetHeight}px</div>
                                    <div>ScrollWidth: {tableContainerRef.current?.scrollWidth}px</div>
                                    <div>ScrollHeight: {tableContainerRef.current?.scrollHeight}px</div>
                                </div>

                                <div className="border-b border-white/10 pb-2">
                                    <div className="text-lime-400 font-bold mb-1">Overflow Status:</div>
                                    <div>Horizontal: {tableContainerRef.current && tableContainerRef.current.scrollWidth > tableContainerRef.current.offsetWidth ? '🔴 YES' : '🟢 NO'}</div>
                                    <div>Vertical: {tableContainerRef.current && tableContainerRef.current.scrollHeight > tableContainerRef.current.offsetHeight ? '🔴 YES' : '🟢 NO'}</div>
                                </div>

                                <div>
                                    <div className="text-lime-400 font-bold mb-1">Scrollbar Visible:</div>
                                    <div>H-Scroll: {tableContainerRef.current && tableContainerRef.current.scrollWidth > tableContainerRef.current.offsetWidth ? '✅ Should be visible' : '❌ Not needed'}</div>
                                    <div>V-Scroll: {tableContainerRef.current && tableContainerRef.current.scrollHeight > tableContainerRef.current.offsetHeight ? '✅ Should be visible' : '❌ Not needed'}</div>
                                </div>

                                <div className="mt-3 pt-2 border-t border-white/10">
                                    <div className="text-yellow-400 text-[10px]">
                                        Green outline = scrollable area<br />
                                        Check console for detailed logs
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div >
            </div >
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

                {/* Error Display */}
                {ErrorDisplay && <div className="w-full">{ErrorDisplay}</div>}

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
