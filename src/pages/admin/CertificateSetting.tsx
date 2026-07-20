import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react'
import {
    Upload, Plus, Trash2, Save, Award, AlertCircle, Eye, EyeOff, Crosshair,
    CheckCircle2, Loader2, GripVertical, ChevronDown, AlignLeft, AlignCenter, AlignRight
} from 'lucide-react'
import { toast } from 'react-toastify'
import Draggable from 'react-draggable'
import * as pdfjsLib from 'pdfjs-dist'
import api from '../../services/api'
import CustomSelect from '../../components/admin/CustomSelect'

// @ts-ignore — Vite resolves ?url ke path lokal worker file
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.js?url'

// Set worker lokal (tidak perlu CDN, tidak kena CORS)
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl

// ── Tipe Data ─────────────────────────────────────────────────────────────────
interface CertField {
    id: string
    label: string
    x: number       // dalam persen (%) relatif ke container
    y: number
    font_size: number
    font_color: string
    width: number
    text_align: 'left' | 'center' | 'right'
    font_family: string
    font_weight: number
    font_style: 'normal' | 'italic'
    preview_text: string
    preview_width?: number
}

// Field yang tersedia untuk ditambahkan
const AVAILABLE_FIELDS = [
    { id: 'nama',              label: 'Nama Peserta' },
    { id: 'institusi',         label: 'Institusi / Sekolah' },
    { id: 'prodi',             label: 'Program Studi' },
    { id: 'periode',           label: 'Periode Magang' },
    { id: 'nomor_sertifikat',  label: 'Nomor Sertifikat' },
    { id: 'tanggal_terbit',    label: 'Tanggal Terbit' },
]

// ── Warna tiap field ──────────────────────────────────────────────────────────
const FIELD_COLORS: Record<string, string> = {
    nama:             'border-rose-500 bg-rose-500/10 text-rose-700',
    institusi:        'border-blue-500 bg-blue-500/10 text-blue-700',
    prodi:            'border-violet-500 bg-violet-500/10 text-violet-700',
    periode:          'border-amber-500 bg-amber-500/10 text-amber-700',
    nomor_sertifikat: 'border-emerald-500 bg-emerald-500/10 text-emerald-700',
    tanggal_terbit:   'border-sky-500 bg-sky-500/10 text-sky-700',
}

// Data contoh hanya untuk kanvas preview. Sertifikat hasil generate tetap
// menggunakan data pendaftar yang sebenarnya dari database.
const FIELD_PREVIEW_VALUES: Record<string, string> = {
    nama: 'Muhammad Rizky Pratama Wijaya Kusuma',
    institusi: 'Universitas Pembangunan Nasional Veteran Jakarta',
    prodi: 'Teknik Informatika',
    periode: '01 Agustus 2026 – 31 Desember 2026',
    nomor_sertifikat: 'W.10-1234/PK.01.01/2026',
    tanggal_terbit: '16 Juli 2026',
}

const CERTIFICATE_FONTS = [
    { value: 'helvetica', label: 'Arial / Helvetica', fontFamily: 'Arial, Helvetica, sans-serif' },
    { value: 'times', label: 'Times New Roman', fontFamily: '"Times New Roman", Times, serif' },
    { value: 'georgia', label: 'Georgia', fontFamily: 'Georgia, serif' },
    { value: 'montserrat', label: 'Montserrat', fontFamily: 'Montserrat, Arial, sans-serif' },
    { value: 'poppins', label: 'Poppins', fontFamily: 'Poppins, sans-serif' },
    { value: 'playfair', label: 'Playfair Display', fontFamily: '"Playfair Display", Georgia, serif' },
    { value: 'dancing-script', label: 'Dancing Script', fontFamily: '"Dancing Script", cursive' },
    { value: 'great-vibes', label: 'Great Vibes', fontFamily: '"Great Vibes", cursive' },
]

const FONT_VARIANTS: Record<string, Array<{ weight: number; style: 'normal' | 'italic'; label: string }>> = {
    helvetica: [400, 700].flatMap(weight => [
        { weight, style: 'normal' as const, label: weight === 400 ? 'Regular' : 'Bold' },
        { weight, style: 'italic' as const, label: weight === 400 ? 'Italic' : 'Bold Italic' },
    ]),
    times: [400, 700].flatMap(weight => [
        { weight, style: 'normal' as const, label: weight === 400 ? 'Regular' : 'Bold' },
        { weight, style: 'italic' as const, label: weight === 400 ? 'Italic' : 'Bold Italic' },
    ]),
    georgia: [400, 700].flatMap(weight => [
        { weight, style: 'normal' as const, label: weight === 400 ? 'Regular' : 'Bold' },
        { weight, style: 'italic' as const, label: weight === 400 ? 'Italic' : 'Bold Italic' },
    ]),
    montserrat: [200, 300, 400, 500, 600, 700, 800].flatMap(weight => {
        const name = ({ 200: 'ExtraLight', 300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold', 800: 'ExtraBold' } as Record<number, string>)[weight]
        return [
            { weight, style: 'normal' as const, label: name },
            { weight, style: 'italic' as const, label: `${name} Italic` },
        ]
    }),
    poppins: [400, 700].flatMap(weight => [
        { weight, style: 'normal' as const, label: weight === 400 ? 'Regular' : 'Bold' },
        { weight, style: 'italic' as const, label: weight === 400 ? 'Italic' : 'Bold Italic' },
    ]),
    playfair: [400, 500, 600, 700, 800].flatMap(weight => {
        const name = ({ 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold', 800: 'ExtraBold' } as Record<number, string>)[weight]
        return [
            { weight, style: 'normal' as const, label: name },
            { weight, style: 'italic' as const, label: `${name} Italic` },
        ]
    }),
    'dancing-script': [400, 500, 600, 700].map(weight => ({
        weight,
        style: 'normal' as const,
        label: ({ 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold' } as Record<number, string>)[weight],
    })),
    'great-vibes': [{ weight: 400, style: 'normal', label: 'Regular' }],
}

const FONT_CSS: Record<string, string> = {
    helvetica: 'Arial, Helvetica, sans-serif',
    times: '"Times New Roman", Times, serif',
    georgia: 'Georgia, serif',
    montserrat: 'Montserrat, Arial, sans-serif',
    poppins: 'Poppins, sans-serif',
    playfair: '"Playfair Display", Georgia, serif',
    'dancing-script': '"Dancing Script", cursive',
    'great-vibes': '"Great Vibes", cursive',
}

const AutoFitText = ({ text, maxSize, align, fontFamily, fontWeight, fontStyle }: { text: string; maxSize: number; align: CertField['text_align']; fontFamily: string; fontWeight: number; fontStyle: CertField['font_style'] }) => {
    const ref = useRef<HTMLSpanElement>(null)
    const [size, setSize] = useState(maxSize)

    useLayoutEffect(() => {
        const element = ref.current
        if (!element) return
        const fit = () => {
            element.style.fontSize = `${maxSize}px`
            const available = element.clientWidth
            const needed = element.scrollWidth
            setSize(needed > available ? Math.max(8, Math.floor(maxSize * available / needed)) : maxSize)
        }
        fit()
        const observer = new ResizeObserver(fit)
        observer.observe(element)
        return () => observer.disconnect()
    }, [text, maxSize, fontFamily, fontWeight, fontStyle])

    return <span ref={ref} className="min-w-0 flex-1 overflow-hidden whitespace-nowrap" style={{ fontSize: size, lineHeight: 1, textAlign: align, fontFamily, fontWeight, fontStyle }}>{text}</span>
}

interface DraggableFieldProps {
    field: CertField
    position: { x: number; y: number }
    selected: boolean
    width: number
    previewMode: boolean
    onSelect: () => void
    onStop: (x: number, y: number) => void
    onResize: (x: number, width: number) => void
}

// react-draggable tidak boleh lagi mengandalkan findDOMNode pada React 19.
// nodeRef eksplisit memastikan DraggableCore selalu menerima elemen DOM yang benar.
const DraggableField = ({ field, position, selected, width, previewMode, onSelect, onStop, onResize }: DraggableFieldProps) => {
    const nodeRef = useRef<HTMLDivElement>(null)

    const startResize = (side: 'left' | 'right', event: React.PointerEvent) => {
        event.preventDefault()
        event.stopPropagation()
        const startClientX = event.clientX
        const startX = position.x
        const startWidth = width
        const rightEdge = startX + startWidth
        const onMove = (moveEvent: PointerEvent) => {
            const delta = moveEvent.clientX - startClientX
            if (side === 'right') onResize(startX, Math.max(40, startWidth + delta))
            else {
                const nextX = Math.min(rightEdge - 40, Math.max(0, startX + delta))
                onResize(nextX, rightEdge - nextX)
            }
        }
        const onUp = () => {
            window.removeEventListener('pointermove', onMove)
            window.removeEventListener('pointerup', onUp)
        }
        window.addEventListener('pointermove', onMove)
        window.addEventListener('pointerup', onUp)
    }

    return (
        <Draggable
            nodeRef={nodeRef}
            position={position}
            bounds="parent"
            disabled={previewMode}
            cancel=".resize-handle"
            onStop={(_event, data) => onStop(data.x, data.y)}
            onStart={onSelect}
        >
            <div
                ref={nodeRef}
                className={`absolute z-20 flex items-start whitespace-nowrap ${previewMode ? 'border-transparent bg-transparent shadow-none' : `${FIELD_COLORS[field.id] ?? 'border-gray-400 bg-gray-100 text-gray-700'} cursor-grab border active:cursor-grabbing`} ${selected && !previewMode ? 'ring-2 ring-primary' : ''}`}
                style={{
                    top: 0,
                    left: 0,
                    width,
                    color: field.font_color,
                }}
                onClick={onSelect}
            >
                {!previewMode && <GripVertical size={12} className="mx-1 shrink-0 opacity-60" />}
                <AutoFitText text={field.preview_text} maxSize={field.font_size} align={field.text_align} fontFamily={FONT_CSS[field.font_family] ?? FONT_CSS.helvetica} fontWeight={field.font_weight} fontStyle={field.font_style} />
                {!previewMode && selected && <>
                    <button type="button" className="resize-handle absolute inset-y-0 left-0 w-2 cursor-ew-resize bg-current/20" onPointerDown={event => startResize('left', event)} aria-label="Ubah lebar dari kiri" />
                    <button type="button" className="resize-handle absolute inset-y-0 right-0 w-2 cursor-ew-resize bg-current/20" onPointerDown={event => startResize('right', event)} aria-label="Ubah lebar dari kanan" />
                </>}
            </div>
        </Draggable>
    )
}

// ── Komponen utama ────────────────────────────────────────────────────────────
const CertificateSettingPage = () => {
    const [templateUrl, setTemplateUrl]       = useState<string | null>(null)
    const [templatePath, setTemplatePath]     = useState<string | null>(null)
    const [fields, setFields]                 = useState<CertField[]>([])
    const [loading, setLoading]               = useState(true)
    const [uploading, setUploading]           = useState(false)
    const [saving, setSaving]                 = useState(false)
    const [pdfImageUrl, setPdfImageUrl]       = useState<string | null>(null)
    const [pdfRendering, setPdfRendering]     = useState(false)
    const [showAddMenu, setShowAddMenu]       = useState(false)
    const [selectedField, setSelectedField]   = useState<string | null>(null)
    const [isDraggingOver, setIsDraggingOver] = useState(false)
    const [deleting, setDeleting]             = useState(false)
    const [previewMode, setPreviewMode]       = useState(false)
    const [showGuides, setShowGuides]         = useState(true)

    const containerRef  = useRef<HTMLDivElement>(null)
    const fileInputRef  = useRef<HTMLInputElement>(null)
    const addMenuRef    = useRef<HTMLDivElement>(null)

    // Posisi draggable (dalam piksel, dikonversi ke % saat simpan)
    const [pixelPositions, setPixelPositions] = useState<Record<string, { x: number; y: number }>>({})

    // ── Fetch settings dari backend ───────────────────────────────────────────
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/admin/certificate/settings')
                const data = res.data?.data
                setTemplateUrl(data?.template_url ?? null)
                setTemplatePath(data?.template_path ?? null)
                setFields((data?.fields ?? []).map((field: Partial<CertField> & Pick<CertField, 'id' | 'label'>) => ({
                    ...field,
                    x: Number(field.x ?? 10),
                    y: Number(field.y ?? 10),
                    width: Number(field.width ?? 40),
                    font_size: Number(field.font_size ?? 14),
                    font_color: field.font_color ?? '#1a1a1a',
                    text_align: field.text_align ?? 'center',
                    font_family: field.font_family ?? 'helvetica',
                    font_weight: Number(field.font_weight ?? 400),
                    font_style: field.font_style ?? 'normal',
                    preview_text: field.preview_text ?? FIELD_PREVIEW_VALUES[field.id] ?? field.label,
                })))
            } catch {
                toast.error('Gagal memuat pengaturan sertifikat')
            } finally {
                setLoading(false)
            }
        }
        fetchSettings()
    }, [])

    // ── Render PDF ke canvas saat template berubah ────────────────────────────
    useEffect(() => {
        if (!templatePath) return
        // Gunakan path relatif API — axios akan otomatis pakai baseURL + Bearer token
        renderPdfToImage('/admin/certificate/template/preview')
    }, [templatePath])

    // ── Inisialisasi posisi piksel dari persen saat gambar PDF siap ───────────
    useEffect(() => {
        if (!pdfImageUrl || !containerRef.current) return
        const { width, height } = containerRef.current.getBoundingClientRect()
        const initial: Record<string, { x: number; y: number }> = {}
        fields.forEach(f => {
            initial[f.id] = {
                x: (f.x / 100) * width,
                y: (f.y / 100) * height,
            }
        })
        setPixelPositions(initial)
    }, [pdfImageUrl, fields])

    // ── Tutup add menu saat klik luar ─────────────────────────────────────────
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
                setShowAddMenu(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const renderPdfToImage = async (url: string) => {
        setPdfRendering(true)
        setPdfImageUrl(null)
        try {
            // Gunakan axios agar token auth otomatis disertakan
            const response = await api.get(url, { responseType: 'arraybuffer' })
            const arrayBuffer: ArrayBuffer = response.data

            const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) })
            const pdf         = await loadingTask.promise
            const page        = await pdf.getPage(1)
            const viewport    = page.getViewport({ scale: 2.0 })

            const canvas    = document.createElement('canvas')
            canvas.width    = viewport.width
            canvas.height   = viewport.height

            const ctx = canvas.getContext('2d')!
            // pdfjs v3: tidak perlu property 'canvas' di render params
            await page.render({ canvasContext: ctx, viewport }).promise

            setPdfImageUrl(canvas.toDataURL('image/png'))
        } catch (err) {
            console.error('PDF render error:', err)
            toast.error('Gagal merender preview PDF. Pastikan file PDF valid.')
        } finally {
            setPdfRendering(false)
        }
    }

    // ── Upload file (shared logic dari input & drop) ──────────────────────────
    const uploadFile = async (file: File) => {
        if (file.type !== 'application/pdf') {
            toast.error('Hanya file PDF yang diperbolehkan')
            return
        }
        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('template', file)
            const res = await api.post('/admin/certificate/template', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            const data = res.data?.data
            setTemplateUrl(data?.template_url)
            setTemplatePath(data?.template_path)
            toast.success('Template berhasil diupload!')
        } catch {
            toast.error('Gagal mengupload template PDF')
        } finally {
            setUploading(false)
        }
    }

    // ── Upload via input file ─────────────────────────────────────────────────
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        e.target.value = ''
        if (!file) return
        await uploadFile(file)
    }

    // ── Drag & Drop handlers ──────────────────────────────────────────────────
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDraggingOver(true)
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDraggingOver(false)
    }

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDraggingOver(false)
        const file = e.dataTransfer.files?.[0]
        if (!file) return
        await uploadFile(file)
    }


    // ── Hapus template ──────────────────────────────────────────────────────────
    const handleDeleteTemplate = async () => {
        if (!window.confirm('Hapus template sertifikat? Semua posisi field akan tetap tersimpan.')) return
        setDeleting(true)
        try {
            await api.delete('/admin/certificate/template')
            setTemplateUrl(null)
            setTemplatePath(null)
            setPdfImageUrl(null)
            toast.success('Template berhasil dihapus')
        } catch {
            toast.error('Gagal menghapus template')
        } finally {
            setDeleting(false)
        }
    }

    // ── Tambah field baru ─────────────────────────────────────────────────────
    const handleAddField = (fieldId: string) => {
        const meta = AVAILABLE_FIELDS.find(f => f.id === fieldId)
        if (!meta) return

        // Cek duplikat
        if (fields.some(f => f.id === fieldId)) {
            toast.warn(`Field "${meta.label}" sudah ditambahkan`)
            setShowAddMenu(false)
            return
        }

        const newField: CertField = {
            id:         fieldId,
            label:      meta.label,
            x:          10,
            y:          10,
            font_size:  14,
            font_color: '#1a1a1a',
            width:      40,
            text_align: 'center',
            font_family: 'helvetica',
            font_weight: 400,
            font_style: 'normal',
            preview_text: FIELD_PREVIEW_VALUES[fieldId] ?? meta.label,
        }
        setFields(prev => [...prev, newField])

        // Set posisi piksel default
        const container = containerRef.current
        if (container) {
            const { width, height } = container.getBoundingClientRect()
            setPixelPositions(prev => ({
                ...prev,
                [fieldId]: { x: width * 0.10, y: height * 0.10 },
            }))
        }

        setShowAddMenu(false)
        toast.info(`Field "${meta.label}" ditambahkan`)
    }

    // ── Hapus field ───────────────────────────────────────────────────────────
    const handleRemoveField = (fieldId: string) => {
        setFields(prev => prev.filter(f => f.id !== fieldId))
        setPixelPositions(prev => {
            const next = { ...prev }
            delete next[fieldId]
            return next
        })
        if (selectedField === fieldId) setSelectedField(null)
    }

    // ── Update posisi setelah drag selesai ────────────────────────────────────
    const handleDragStop = useCallback((fieldId: string, x: number, y: number) => {
        const container = containerRef.current
        if (!container) return

        const { width, height } = container.getBoundingClientRect()
        const xPct = Math.min(Math.max((x / width) * 100, 0), 95)
        const yPct = Math.min(Math.max((y / height) * 100, 0), 95)

        setFields(prev =>
            prev.map(f => f.id === fieldId ? { ...f, x: xPct, y: yPct } : f)
        )
        setPixelPositions(prev => ({ ...prev, [fieldId]: { x, y } }))
    }, [])

    const updateField = (fieldId: string, changes: Partial<CertField>) => {
        setFields(prev => prev.map(field => field.id === fieldId ? { ...field, ...changes } : field))
    }

    const handleResize = (fieldId: string, x: number, widthPx: number) => {
        const container = containerRef.current
        if (!container) return
        const containerWidth = container.getBoundingClientRect().width
        const safeX = Math.max(0, Math.min(x, containerWidth - 40))
        const safeWidth = Math.max(40, Math.min(widthPx, containerWidth - safeX))
        setPixelPositions(prev => ({ ...prev, [fieldId]: { ...prev[fieldId], x: safeX } }))
        updateField(fieldId, {
            x: (safeX / containerWidth) * 100,
            width: (safeWidth / containerWidth) * 100,
        })
    }

    const centerField = (field: CertField, axis: 'horizontal' | 'vertical') => {
        const container = containerRef.current
        if (!container) return
        const { width, height } = container.getBoundingClientRect()
        if (axis === 'horizontal') {
            const xPct = (100 - field.width) / 2
            updateField(field.id, { x: xPct })
            setPixelPositions(prev => ({ ...prev, [field.id]: { ...prev[field.id], x: (xPct / 100) * width } }))
        } else {
            const yPx = Math.max(0, (height - 36) / 2)
            updateField(field.id, { y: (yPx / height) * 100 })
            setPixelPositions(prev => ({ ...prev, [field.id]: { ...prev[field.id], y: yPx } }))
        }
    }

    const makeFullWidthCenter = (field: CertField) => {
        updateField(field.id, { x: 0, width: 100, text_align: 'center' })
        setPixelPositions(prev => ({ ...prev, [field.id]: { ...prev[field.id], x: 0 } }))
    }

    // ── Simpan semua posisi ke backend ────────────────────────────────────────
    const handleSave = async () => {
        if (fields.length === 0) {
            toast.warn('Tambahkan minimal 1 field sebelum menyimpan')
            return
        }
        setSaving(true)
        try {
            const previewWidth = containerRef.current?.getBoundingClientRect().width ?? 1024
            const fieldsWithPreviewScale = fields.map(field => ({
                ...field,
                preview_width: Math.round(previewWidth),
            }))
            await api.post('/admin/certificate/fields', { fields: fieldsWithPreviewScale })
            setFields(fieldsWithPreviewScale)
            toast.success('Posisi field berhasil disimpan!')
        } catch (error: any) {
            const validationErrors = error.response?.data?.errors
            const firstValidationError = validationErrors
                ? (Object.values(validationErrors).flat()[0] as string | undefined)
                : undefined
            toast.error(firstValidationError || error.response?.data?.message || 'Gagal menyimpan pengaturan field')
        } finally {
            setSaving(false)
        }
    }

    // ── Render ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const usedFieldIds = new Set(fields.map(f => f.id))
    const availableToAdd = AVAILABLE_FIELDS.filter(f => !usedFieldIds.has(f.id))
    const selectedFieldData = fields.find(field => field.id === selectedField) ?? null

    return (
        <div className="mx-auto max-w-6xl space-y-6 p-6">
            {/* ── Header ── */}
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                    <Award size={22} />
                </div>
                <div>
                    <h1 className="text-xl font-extrabold text-neutral-text">Pengaturan Sertifikat</h1>
                    <p className="text-sm text-neutral-muted">
                        Upload template PDF dari Canva, lalu atur posisi field secara visual
                    </p>
                </div>
            </div>

            {/* ── Section 1: Upload Template ── */}
            <div className="rounded-2xl border border-neutral-border bg-neutral-card p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-neutral-muted">
                    <Upload size={14} />
                    Template PDF
                </h2>

                {templatePath ? (
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`rounded-xl border transition-all ${
                            isDraggingOver
                                ? 'border-primary bg-primary/5 px-4 py-4'
                                : 'border-emerald-200 bg-emerald-50 px-4 py-3'
                        }`}
                    >
                        {isDraggingOver ? (
                            <div className="flex flex-col items-center gap-2 py-2 text-center">
                                <Upload className="h-7 w-7 text-primary" />
                                <p className="text-sm font-semibold text-primary">Lepaskan PDF untuk mengganti template</p>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-emerald-700">
                                    <CheckCircle2 size={16} />
                                    <span className="font-semibold">Template aktif:</span>
                                    <span className="font-mono text-xs">{templatePath.split('/').pop()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading || deleting}
                                        className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
                                    >
                                        {uploading ? 'Mengupload...' : 'Ganti Template'}
                                    </button>
                                    <button
                                        onClick={handleDeleteTemplate}
                                        disabled={deleting || uploading}
                                        className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                    >
                                        {deleting
                                            ? <Loader2 size={13} className="animate-spin" />
                                            : <Trash2 size={13} />
                                        }
                                        {deleting ? 'Menghapus...' : 'Hapus'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div
                        onClick={() => !uploading && fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`flex w-full cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed py-12 transition-all ${
                            uploading
                                ? 'cursor-not-allowed border-neutral-border bg-neutral-bg opacity-60'
                                : isDraggingOver
                                    ? 'border-primary bg-primary/5 shadow-inner scale-[0.99]'
                                    : 'border-neutral-border bg-neutral-bg hover:border-primary hover:bg-primary/5'
                        }`}
                    >
                        {uploading ? (
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        ) : isDraggingOver ? (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                <Upload className="h-6 w-6 text-primary" />
                            </div>
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-border/40">
                                <Upload className="h-6 w-6 text-neutral-muted" />
                            </div>
                        )}
                        <div className="text-center">
                            <p className={`text-sm font-semibold ${
                                isDraggingOver ? 'text-primary' : 'text-neutral-text'
                            }`}>
                                {uploading
                                    ? 'Mengupload template...'
                                    : isDraggingOver
                                        ? 'Lepaskan file di sini!'
                                        : 'Drag & drop PDF di sini, atau klik untuk pilih'
                                }
                            </p>
                            <p className="mt-1 text-xs text-neutral-muted">
                                Export sertifikat kosong dari Canva sebagai PDF (maks. 10MB)
                            </p>
                        </div>
                    </div>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleFileUpload}
                />
            </div>

            {/* ── Section 2: Visual Editor ── */}
            {templateUrl && (
                <div className="rounded-2xl border border-neutral-border bg-neutral-card p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-neutral-muted">
                            <GripVertical size={14} />
                            Atur Posisi Field
                        </h2>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setPreviewMode(value => !value)}
                                className="flex items-center gap-1.5 rounded-xl border border-neutral-border bg-white px-3 py-2 text-xs font-semibold text-neutral-text"
                            >
                                {previewMode ? <EyeOff size={14} /> : <Eye size={14} />}
                                {previewMode ? 'Kembali Mengatur' : 'Lihat Hasil'}
                            </button>
                            {!previewMode && (
                              <button
                                  type="button"
                                  onClick={() => setShowGuides(value => !value)}
                                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold ${showGuides ? 'border-primary bg-primary/5 text-primary' : 'border-neutral-border bg-white text-neutral-text'}`}
                              >
                                  <Crosshair size={14} />
                                  Garis Tengah
                              </button>
                            )}
                            {/* Tombol Tambah Field */}
                            <div className="relative" ref={addMenuRef}>
                                <button
                                    onClick={() => setShowAddMenu(v => !v)}
                                    disabled={availableToAdd.length === 0}
                                    className="flex items-center gap-1.5 rounded-xl border border-neutral-border bg-white px-3 py-2 text-xs font-semibold text-neutral-text shadow-sm transition hover:bg-neutral-bg disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <Plus size={14} />
                                    Tambah Field
                                    <ChevronDown size={12} />
                                </button>
                                {showAddMenu && availableToAdd.length > 0 && (
                                    <div className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-xl border border-neutral-border bg-white shadow-lg">
                                        {availableToAdd.map(f => (
                                            <button
                                                key={f.id}
                                                onClick={() => handleAddField(f.id)}
                                                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-medium text-neutral-text transition hover:bg-neutral-bg first:rounded-t-xl last:rounded-b-xl"
                                            >
                                                <span className={`h-2 w-2 rounded-full ${FIELD_COLORS[f.id]?.split(' ')[1] ?? 'bg-gray-400'}`} />
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Tombol Simpan */}
                            <button
                                onClick={handleSave}
                                disabled={saving || fields.length === 0}
                                className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-primary/90 active:scale-95 disabled:opacity-50"
                            >
                                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                {saving ? 'Menyimpan...' : 'Simpan Posisi'}
                            </button>
                        </div>
                    </div>

                    {/* Info hint */}
                    <div className="mb-3 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                        <AlertCircle size={13} />
                        Drag kotak ke posisi yang sesuai di atas template sertifikat, lalu klik Simpan Posisi.
                    </div>

                    {/* Preview dan panel pengaturan field. */}
                    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                      <div
                          ref={containerRef}
                          className="relative mx-auto w-full overflow-hidden rounded-xl border border-neutral-border shadow-md"
                          style={{ userSelect: 'none' }}
                      >
                        {pdfRendering ? (
                            <div className="flex h-64 items-center justify-center bg-neutral-bg">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <span className="ml-2 text-sm text-neutral-muted">Merender preview PDF...</span>
                            </div>
                        ) : pdfImageUrl ? (
                            <>
                                <img
                                    src={pdfImageUrl}
                                    alt="Preview template sertifikat"
                                    className="block w-full"
                                    draggable={false}
                                />

                                {showGuides && !previewMode && (
                                  <div className="pointer-events-none absolute inset-0 z-10">
                                    <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-fuchsia-500/80">
                                      <span className="absolute left-1 top-2 rounded bg-fuchsia-600 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white">Tengah</span>
                                    </div>
                                    <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-cyan-500/80">
                                      <span className="absolute right-2 top-1 rounded bg-cyan-600 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white">Tengah</span>
                                    </div>
                                    <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-primary shadow" />
                                  </div>
                                )}

                                {/* Draggable field boxes */}
                                {fields.map(field => {
                                    const pos = pixelPositions[field.id]
                                    if (!pos) return null

                                    return (
                                        <DraggableField
                                            key={field.id}
                                            field={field}
                                            position={pos}
                                            selected={selectedField === field.id}
                                            width={((containerRef.current?.clientWidth ?? 400) * field.width) / 100}
                                            previewMode={previewMode}
                                            onSelect={() => setSelectedField(field.id)}
                                            onStop={(x, y) => handleDragStop(field.id, x, y)}
                                            onResize={(x, width) => handleResize(field.id, x, width)}
                                        />
                                    )
                                })}
                            </>
                        ) : null}
                      </div>

                      <aside className="rounded-xl border border-neutral-border bg-neutral-bg p-4">
                        <h3 className="mb-4 text-xs font-extrabold uppercase tracking-wider text-neutral-muted">Pengaturan Field</h3>
                        {selectedFieldData ? (
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-bold text-neutral-text">{selectedFieldData.label}</p>
                              <p className="mt-0.5 text-[10px] text-neutral-muted">Lebar {Math.round(selectedFieldData.width)}%</p>
                            </div>
                            <label className="block">
                              <span className="mb-1.5 block text-[11px] font-bold text-neutral-muted">Teks Preview</span>
                              <input value={selectedFieldData.preview_text} onChange={event => updateField(selectedFieldData.id, { preview_text: event.target.value })} className="w-full rounded-lg border border-neutral-border bg-white px-3 py-2 text-xs outline-none focus:border-primary" />
                            </label>
                            <div>
                              <span className="mb-1.5 block text-[11px] font-bold text-neutral-muted">Jenis Font</span>
                              <CustomSelect options={CERTIFICATE_FONTS} value={selectedFieldData.font_family} onChange={fontFamily => {
                                const variants = FONT_VARIANTS[fontFamily] ?? FONT_VARIANTS.helvetica
                                const currentAvailable = variants.some(variant => variant.weight === selectedFieldData.font_weight && variant.style === selectedFieldData.font_style)
                                updateField(selectedFieldData.id, {
                                  font_family: fontFamily,
                                  ...(!currentAvailable ? { font_weight: variants[0].weight, font_style: variants[0].style } : {}),
                                })
                              }} fullWidth />
                            </div>
                            <div>
                              <span className="mb-1.5 block text-[11px] font-bold text-neutral-muted">Varian Font</span>
                              <CustomSelect
                                options={(FONT_VARIANTS[selectedFieldData.font_family] ?? FONT_VARIANTS.helvetica).map(variant => ({
                                  value: `${variant.weight}-${variant.style}`,
                                  label: variant.label,
                                  fontFamily: FONT_CSS[selectedFieldData.font_family],
                                }))}
                                value={`${selectedFieldData.font_weight}-${selectedFieldData.font_style}`}
                                onChange={value => {
                                  const [weight, style] = value.split('-')
                                  updateField(selectedFieldData.id, { font_weight: Number(weight), font_style: style as CertField['font_style'] })
                                }}
                                fullWidth
                              />
                            </div>
                            <label className="block">
                              <span className="mb-1.5 block text-[11px] font-bold text-neutral-muted">Ukuran Maksimal</span>
                              <div className="flex items-center gap-2">
                                <input type="range" min={6} max={72} value={selectedFieldData.font_size} onChange={event => updateField(selectedFieldData.id, { font_size: Number(event.target.value) })} className="min-w-0 flex-1 accent-primary" />
                                <input type="number" min={6} max={72} value={selectedFieldData.font_size} onChange={event => updateField(selectedFieldData.id, { font_size: Number(event.target.value) })} className="w-14 rounded-lg border border-neutral-border bg-white px-2 py-1.5 text-center text-xs font-bold" />
                              </div>
                            </label>
                            <div>
                              <span className="mb-1.5 block text-[11px] font-bold text-neutral-muted">Alignment</span>
                              <div className="grid grid-cols-3 gap-1 rounded-lg bg-white p-1">
                                {([['left', AlignLeft], ['center', AlignCenter], ['right', AlignRight]] as const).map(([alignment, Icon]) => (
                                  <button key={alignment} type="button" onClick={() => updateField(selectedFieldData.id, { text_align: alignment })} className={`flex h-8 items-center justify-center rounded-md ${selectedFieldData.text_align === alignment ? 'bg-primary text-white' : 'text-neutral-muted hover:bg-neutral-bg'}`}><Icon size={15} /></button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="mb-1.5 block text-[11px] font-bold text-neutral-muted">Posisi Cepat</span>
                              <div className="grid grid-cols-2 gap-2">
                                <button type="button" onClick={() => centerField(selectedFieldData, 'horizontal')} className="rounded-lg border border-neutral-border bg-white px-2 py-2 text-[10px] font-bold text-neutral-text hover:border-primary hover:text-primary">Tengah Horizontal</button>
                                <button type="button" onClick={() => centerField(selectedFieldData, 'vertical')} className="rounded-lg border border-neutral-border bg-white px-2 py-2 text-[10px] font-bold text-neutral-text hover:border-primary hover:text-primary">Tengah Vertikal</button>
                                <button type="button" onClick={() => makeFullWidthCenter(selectedFieldData)} className="col-span-2 rounded-lg bg-primary/10 px-2 py-2 text-[10px] font-bold text-primary hover:bg-primary/20">Tengahkan Sempurna (Lebar 100%)</button>
                              </div>
                            </div>
                            <label className="block">
                              <span className="mb-1.5 block text-[11px] font-bold text-neutral-muted">Warna Teks</span>
                              <div className="flex items-center gap-2 rounded-lg border border-neutral-border bg-white p-2">
                                <input type="color" value={selectedFieldData.font_color} onChange={event => updateField(selectedFieldData.id, { font_color: event.target.value })} className="h-7 w-9 cursor-pointer border-0 bg-transparent" />
                                <span className="text-xs font-mono">{selectedFieldData.font_color}</span>
                              </div>
                            </label>
                            <button type="button" onClick={() => handleRemoveField(selectedFieldData.id)} className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 py-2 text-xs font-bold text-red-600 hover:bg-red-50"><Trash2 size={13} /> Hapus Field</button>
                          </div>
                        ) : (
                          <p className="text-xs leading-relaxed text-neutral-muted">Klik salah satu field pada sertifikat untuk mengatur teks, font, ukuran, alignment, dan warnanya.</p>
                        )}
                      </aside>
                    </div>

                    {/* Daftar field aktif + font size editor */}
                    {fields.length > 0 && (
                        <div className="mt-4 rounded-xl border border-neutral-border bg-neutral-bg p-4">
                            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-muted">
                                Field Aktif ({fields.length})
                            </p>
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                {fields.map(f => (
                                    <div
                                        key={f.id}
                                        className={`flex items-center justify-between rounded-lg border px-3 py-2 ${FIELD_COLORS[f.id] ?? 'border-gray-200 bg-white'}`}
                                    >
                                        <span className="text-xs font-semibold">{f.label}</span>
                                        <div className="flex items-center gap-1.5">
                                            <label className="text-[10px] opacity-70">px</label>
                                            <input
                                                type="number"
                                                value={f.font_size}
                                                min={6}
                                                max={72}
                                                onChange={e =>
                                                    setFields(prev =>
                                                        prev.map(field =>
                                                            field.id === f.id
                                                                ? { ...field, font_size: Number(e.target.value) }
                                                                : field
                                                        )
                                                    )
                                                }
                                                className="w-12 rounded border border-current/30 bg-white/80 px-1.5 py-0.5 text-center text-xs font-bold"
                                            />
                                            <button
                                                onClick={() => handleRemoveField(f.id)}
                                                className="rounded p-0.5 opacity-60 transition hover:opacity-100"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Empty state jika belum ada template ── */}
            {!templateUrl && !loading && (
                <div className="rounded-2xl border border-dashed border-neutral-border bg-neutral-bg py-16 text-center">
                    <Award className="mx-auto mb-3 h-12 w-12 text-neutral-muted/50" />
                    <p className="text-sm font-semibold text-neutral-muted">Upload template PDF terlebih dahulu</p>
                    <p className="mt-1 text-xs text-neutral-muted/70">
                        Design di Canva → Export sebagai PDF → Upload di sini
                    </p>
                </div>
            )}
        </div>
    )
}

export default CertificateSettingPage
