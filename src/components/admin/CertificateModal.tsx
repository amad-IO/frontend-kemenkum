import { useState, useEffect } from 'react'
import { Award, X, Download, RefreshCw, Loader2, Users, Calendar, Building2, Hash } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '../../services/api'
import type { Submission } from '../../pages/admin/ListPendaftar'

interface Props {
    submission: Submission | null
    onClose: () => void
    onSuccess: (submission: Submission) => void
}

const parseMember = (memberStr: string | null) => {
    if (!memberStr) return null
    const [nama, nim] = memberStr.split('|')
    return { nama: nama?.trim() ?? '-', nim: nim?.trim() ?? '' }
}

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })

const CertificateModal = ({ submission, onClose, onSuccess }: Props) => {
    const [generating, setGenerating] = useState(false)
    const [downloading, setDownloading] = useState(false)

    // Kumpulkan semua member
    const memberKeys = ['member_1','member_2','member_3','member_4','member_5',
                        'member_6','member_7','member_8','member_9','member_10'] as const
    const members = submission
        ? (memberKeys
            .map(key => parseMember((submission as any)[key]))
            .filter(Boolean) as { nama: string; nim: string }[])
        : []

    // State untuk suffix nomor sertifikat per anggota
    const [suffixes, setSuffixes] = useState<string[]>(() => {
        if (submission?.certificate_number_suffixes && Array.isArray(submission.certificate_number_suffixes)) {
            return members.map((_, idx) => submission.certificate_number_suffixes?.[idx] ?? '')
        }
        return members.map(() => '')
    })

    useEffect(() => {
        if (submission?.certificate_number_suffixes && Array.isArray(submission.certificate_number_suffixes)) {
            setSuffixes(members.map((_, idx) => submission.certificate_number_suffixes?.[idx] ?? ''))
        } else {
            setSuffixes(members.map(() => ''))
        }
    }, [submission?.id, members.length])

    if (!submission) return null

    const hasExisting = !!submission.certificate_generated_at
    const generatedAt = hasExisting
        ? new Date(submission.certificate_generated_at as string).toLocaleString('id-ID')
        : null

    const isAllSuffixesFilled = members.length > 0 &&
        suffixes.length === members.length &&
        !suffixes.some(s => !s || s.trim() === '')

    // ── Generate sertifikat baru ──────────────────────────────────────────────
    const handleGenerate = async () => {
        if (!isAllSuffixesFilled) {
            toast.warn('Mohon lengkapi suffix nomor sertifikat untuk semua peserta')
            return
        }

        const trimmedSuffixes = suffixes.map(s => s.trim())
        setGenerating(true)
        try {
            const res = await api.post(`/admin/submissions/${submission.id}/certificate`, {
                suffixes: trimmedSuffixes,
            })
            const data = res.data?.data

            // Auto-download ZIP via API (bypasses symlink and APP_URL issues on Hostinger)
            const downloadRes = await api.get(`/admin/submissions/${submission.id}/certificate/download`, {
                responseType: 'blob',
            })
            const url = URL.createObjectURL(new Blob([downloadRes.data], { type: 'application/zip' }))
            const a = document.createElement('a')
            a.href = url
            a.download = data.zip_filename || `Sertifikat_${submission.id}.zip`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            toast.success(`${data.member_count} sertifikat berhasil di-generate!`)
            onSuccess({
                ...submission,
                certificate_generated_at: data.generated_at,
                certificate_number_suffixes: trimmedSuffixes,
            })
            onClose()
        } catch (err: any) {
            const msg = err.response?.data?.message ?? 'Gagal generate sertifikat'
            toast.error(msg)
        } finally {
            setGenerating(false)
        }
    }

    // ── Re-download ZIP lama ──────────────────────────────────────────────────
    const handleRedownload = async () => {
        setDownloading(true)
        try {
            const res = await api.get(`/admin/submissions/${submission.id}/certificate/download`, {
                responseType: 'blob',
            })
            const disposition = res.headers['content-disposition'] as string | undefined
            let filename = `Sertifikat_${submission.id}.zip`
            if (disposition) {
                const match = disposition.match(/filename[^;=\n]*=\s*(?:UTF-8''|["']?)([^"';\n]+)/i)
                if (match?.[1]) filename = decodeURIComponent(match[1].trim())
            }
            const url = URL.createObjectURL(new Blob([res.data], { type: 'application/zip' }))
            const a = document.createElement('a')
            a.href = url
            a.download = filename
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            toast.success('ZIP sertifikat berhasil diunduh!')
        } catch {
            toast.error('Gagal mengunduh sertifikat')
        } finally {
            setDownloading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={!generating && !downloading ? onClose : undefined}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-neutral-border px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                            <Award size={18} />
                        </div>
                        <div>
                            <h2 className="text-base font-extrabold text-neutral-text">Generate Sertifikat</h2>
                            <p className="text-xs text-neutral-muted">Masukkan suffix nomor surat untuk masing-masing peserta</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={generating || downloading}
                        className="rounded-full p-2 text-neutral-muted transition hover:bg-neutral-bg hover:text-neutral-text disabled:opacity-40"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="max-h-[calc(85vh-140px)] overflow-y-auto space-y-4 p-6">
                    {/* Info submission */}
                    <div className="rounded-xl border border-neutral-border bg-neutral-bg p-4 space-y-2.5">
                        <div className="flex items-center gap-2 text-sm text-neutral-subtle">
                            <Building2 size={14} className="shrink-0 text-neutral-muted" />
                            <span className="font-semibold text-neutral-text">{submission.institution}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-neutral-subtle">
                            <Calendar size={14} className="shrink-0 text-neutral-muted" />
                            <span>{formatDate(submission.start_date)} – {formatDate(submission.end_date)}</span>
                        </div>
                    </div>

                    {/* Daftar peserta & Input Suffix */}
                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-muted">
                                <Users size={12} />
                                Peserta & Nomor Suffix ({members.length} orang)
                            </p>
                            <span className="text-[11px] text-neutral-muted">Format bebas (cth: 001)</span>
                        </div>
                        <div className="space-y-2.5">
                            {members.map((m, i) => (
                                <div
                                    key={i}
                                    className="rounded-xl border border-neutral-border bg-neutral-card p-3 transition focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                                            {i + 1}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-xs font-bold text-neutral-text">{m.nama}</p>
                                            {m.nim && (
                                                <p className="text-[10px] text-neutral-muted">NIM/NISN: {m.nim}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-2.5 flex items-center gap-2 border-t border-neutral-border/60 pt-2">
                                        <label className="flex items-center gap-1 text-[11px] font-bold text-neutral-muted shrink-0">
                                            <Hash size={12} />
                                            Suffix Nomor:
                                        </label>
                                        <input
                                            type="text"
                                            value={suffixes[i] ?? ''}
                                            onChange={(e) => {
                                                const val = e.target.value
                                                setSuffixes(prev => {
                                                    const updated = [...prev]
                                                    updated[i] = val
                                                    return updated
                                                })
                                            }}
                                            placeholder="cth: 001"
                                            className="w-full rounded-lg border border-neutral-border bg-white px-2.5 py-1 text-xs font-mono font-bold text-neutral-text placeholder:font-sans placeholder:font-normal placeholder:text-neutral-400 focus:border-amber-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Output info */}
                    <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
                        Output: <strong>{members.length} file PDF</strong> dalam 1 file <strong>.zip</strong>
                    </div>

                    {/* Info jika sudah pernah generate */}
                    {hasExisting && generatedAt && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                            ⚠️ Sertifikat sudah pernah di-generate pada <strong>{generatedAt}</strong>.
                            Generate ulang akan mengganti file dan nomor sertifikat sebelumnya.
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 border-t border-neutral-border px-6 py-4">
                    <button
                        onClick={onClose}
                        disabled={generating || downloading}
                        className="rounded-xl px-4 py-2 text-sm font-semibold text-neutral-subtle transition hover:bg-neutral-bg disabled:opacity-40"
                    >
                        Batal
                    </button>

                    {/* Re-download jika sudah ada */}
                    {hasExisting && (
                        <button
                            onClick={handleRedownload}
                            disabled={downloading || generating}
                            className="flex items-center gap-1.5 rounded-xl border border-neutral-border bg-white px-4 py-2 text-sm font-semibold text-neutral-text shadow-sm transition hover:bg-neutral-bg disabled:opacity-50"
                        >
                            {downloading
                                ? <Loader2 size={14} className="animate-spin" />
                                : <Download size={14} />
                            }
                            Download Lama
                        </button>
                    )}

                    {/* Generate baru */}
                    <button
                        onClick={handleGenerate}
                        disabled={generating || downloading || !isAllSuffixesFilled}
                        title={!isAllSuffixesFilled ? 'Harap lengkapi semua suffix nomor sertifikat terlebih dahulu' : undefined}
                        className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-amber-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {generating
                            ? <Loader2 size={14} className="animate-spin" />
                            : hasExisting
                                ? <RefreshCw size={14} />
                                : <Award size={14} />
                        }
                        {generating
                            ? 'Memproses...'
                            : hasExisting
                                ? 'Generate Ulang & Download'
                                : 'Generate & Download ZIP'
                        }
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CertificateModal
