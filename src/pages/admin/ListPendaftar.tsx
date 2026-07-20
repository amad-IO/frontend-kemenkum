import { useState, useEffect, useMemo } from 'react'
import { Search, Filter, RefreshCw, ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react'
import { toast } from 'react-toastify'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import DetailPendaftarModal from '../../components/admin/DetailPendaftarModal'
import SubmissionTable from '../../components/admin/SubmissionTable'
import CustomSelect from '../../components/admin/CustomSelect'
import { useAdminChat } from '../../contexts/AdminChatContext'
import { publishSubmissionChatSyncEvent, subscribeSubmissionChatSyncEvents } from '../../shared/submissionChatSync'

export interface Submission {
    id: number
    type: 'magang' | 'penelitian'
    institution: string
    study_program: string
    research_title: string | null
    start_date: string
    end_date: string
    member_1: string
    member_2: string | null
    member_3: string | null
    letter_number: string
    phone_number: string
    status: 'pending' | 'approved' | 'rejected'
    document_downloaded_at: string | null
    discussion_started_at: string | null
    permit_file_path: string | null
    permit_file_name: string | null
    unread_admin_messages_count?: number
    latest_message?: {
        id: number
        sender_type: 'admin' | 'applicant'
        created_at: string
    } | null
    created_at: string
}

const ListPendaftarPage = () => {
    const { openAdminChat, readReceipt } = useAdminChat()
    const queryClient = useQueryClient()

    // ── Data Fetching (TanStack Query) ───────────────────────────────────────
    const {
        data: rawSubmissions = [],
        isLoading: loading,
        isFetching: refreshing,
        refetch,
    } = useQuery({
        queryKey: ['admin-submissions'],
        queryFn: async () => {
            const res = await api.get('/admin/submissions')
            const responseData = res.data?.data
            return (Array.isArray(responseData) ? responseData : (responseData?.data ?? [])) as Submission[]
        },
        staleTime: 8_000,         // data dianggap segar 8 detik
        refetchInterval: 10_000,  // auto-refresh tiap 10 detik (ganti setInterval manual)
        refetchIntervalInBackground: false, // hemat resource — berhenti saat tab hidden
        throwOnError: false,
    })

    // Terapkan patch lokal dari readReceipt (unread count) ke cache TanStack Query
    const [localPatches, setLocalPatches] = useState<Record<number, Partial<Submission>>>({})

    useEffect(() => {
        if (!readReceipt) return
        setLocalPatches(prev => ({
            ...prev,
            [readReceipt.id]: { ...prev[readReceipt.id], unread_admin_messages_count: 0 },
        }))
    }, [readReceipt])

    useEffect(() => {
        return subscribeSubmissionChatSyncEvents((event) => {
            if (event.kind === 'message-sent' || event.kind === 'discussion-started' || event.kind === 'status-updated') {
                queryClient.invalidateQueries({ queryKey: ['admin-submissions'] })
            }
        })
    }, [queryClient])

    // Gabungkan data server dengan local patches
    const submissions: Submission[] = useMemo(
        () => rawSubmissions.map(s => ({ ...s, ...(localPatches[s.id] ?? {}) })),
        [rawSubmissions, localPatches]
    )

    // Helper: update submission di local patches (untuk hasil mutation)
    const patchSubmission = (id: number, patch: Partial<Submission>) => {
        setLocalPatches(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }))
    }

    const [isExporting, setIsExporting] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)
    const [isUploadingPermit, setIsUploadingPermit] = useState(false)
    const [isStartingDiscussion, setIsStartingDiscussion] = useState(false)

    // Filters
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    // Pagination client-side
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    // Modal State
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)

    // Derived data
    const filteredData = useMemo(() => {
        let result = submissions

        // Filter Tipe
        if (typeFilter !== 'all') {
            result = result.filter(s => s.type === typeFilter)
        }

        // Filter Status
        if (statusFilter !== 'all') {
            result = result.filter(s => s.status === statusFilter)
        }

        // Search Name or Instansi
        if (search.trim() !== '') {
            const lowerSearch = search.toLowerCase()
            result = result.filter(s => {
                const ketua = s.member_1?.split('|')[0] ?? ''
                return (
                    ketua.toLowerCase().includes(lowerSearch) ||
                    s.institution.toLowerCase().includes(lowerSearch) ||
                    s.letter_number.toLowerCase().includes(lowerSearch)
                )
            })
        }

        return result
    }, [submissions, search, typeFilter, statusFilter])

    // Pagination calc
    const totalPages = Math.ceil(filteredData.length / itemsPerPage)
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return filteredData.slice(start, start + itemsPerPage)
    }, [filteredData, currentPage])

    useEffect(() => {
        setCurrentPage(1)
    }, [search, typeFilter, statusFilter])

    // Actions
    const handleStatusChange = async (id: number, status: 'approved' | 'rejected') => {
        try {
            setIsUpdating(true)
            await api.patch(`/admin/submissions/${id}/status`, { status })

            patchSubmission(id, { status })
            if (selectedSubmission?.id === id) {
                setSelectedSubmission(prev => prev ? { ...prev, status } : null)
            }

            publishSubmissionChatSyncEvent({
                kind: 'status-updated',
                submissionId: id,
                status,
            })

            toast.success(`Status permohonan berhasil diubah menjadi ${status === 'approved' ? 'Diterima' : 'Ditolak'}`)
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal mengubah status permohonan')
        } finally {
            setIsUpdating(false)
        }
    }

    const handleExportExcel = async (id?: number) => {
        try {
            setIsExporting(true)
            const urlEndpoint = id ? `/admin/submissions/${id}/export` : '/admin/submissions/export'
            const res = await api.get(urlEndpoint, { responseType: 'blob' })
            const url = window.URL.createObjectURL(new Blob([res.data]))
            const link = document.createElement('a')
            link.href = url
            
            const contentDisposition = res.headers['content-disposition'];
            let fileName = id ? `Data_Pendaftar_${id}.xlsx` : 'Data_Pendaftar.xlsx';
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
                if (fileNameMatch && fileNameMatch.length >= 2)
                    fileName = fileNameMatch[1];
            }
            
            link.setAttribute('download', fileName)
            document.body.appendChild(link)
            link.click()
            link.remove()
        } catch (error) {
            console.error('Failed to export', error)
            toast.error('Gagal mengekspor data ke Excel.')
        } finally {
            setIsExporting(false)
        }
    }

    const handleDatesChange = async (id: number, start_date: string, end_date: string) => {
        try {
            setIsUpdating(true)
            await api.patch(`/admin/submissions/${id}/dates`, { start_date, end_date })

            patchSubmission(id, { start_date, end_date })
            if (selectedSubmission?.id === id) {
                setSelectedSubmission(prev => prev ? { ...prev, start_date, end_date } : null)
            }

            toast.success('Tanggal kegiatan berhasil diperbarui')
        } catch {
            toast.error('Gagal memperbarui tanggal kegiatan')
        } finally {
            setIsUpdating(false)
        }
    }

    const handleDownload = async (id: number, e?: React.MouseEvent) => {
        e?.stopPropagation()
        try {
            setIsDownloading(true)
            const res = await api.get(`/admin/submissions/${id}/download`, {
                responseType: 'blob'
            })

            const submission = submissions.find(s => s.id === id)
            let filename = `permohonan-${id}.zip`

            if (submission) {
                const ketua = submission.member_1.split('|')[0] || 'ketua'
                const kampus = submission.institution || 'kampus'

                const cleanKetua = ketua.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
                const cleanKampus = kampus.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')

                filename = `permohonan_${cleanKetua}_${cleanKampus}.zip`
            }

            const url = window.URL.createObjectURL(new Blob([res.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', filename)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)

            const downloadedAt = new Date().toISOString()
            patchSubmission(id, { document_downloaded_at: downloadedAt })
            if (selectedSubmission?.id === id) {
                setSelectedSubmission(prev => prev ? { ...prev, document_downloaded_at: prev.document_downloaded_at ?? downloadedAt } : null)
            }

            toast.success('Berkas berhasil diunduh')
            queryClient.invalidateQueries({ queryKey: ['admin-submissions'] })
        } catch (error: unknown) {
            let message = 'Gagal mengunduh berkas ZIP. File mungkin tidak ditemukan.'

            const responseData = error && typeof error === 'object' && 'response' in error
                ? (error as { response?: { data?: unknown } }).response?.data
                : undefined
            if (responseData instanceof Blob) {
                try {
                    const errorPayload = JSON.parse(await responseData.text())
                    message = errorPayload?.message ?? message
                } catch {
                    // Keep the default message when the server returns a non-JSON error body.
                }
            } else {
                message = responseData && typeof responseData === 'object' && 'message' in responseData
                    ? String(responseData.message)
                    : message
            }

            toast.error(message)
        } finally {
            setIsDownloading(false)
        }
    }

    const handleUploadPermit = async (id: number, file: File, replace = false) => {
        try {
            setIsUploadingPermit(true)
            const formData = new FormData()
            formData.append('permit_file', file)
            if (replace) formData.append('replace', '1')

            const res = await api.post(`/admin/submissions/${id}/permit`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            const updated = res.data?.data as Submission

            patchSubmission(id, { permit_file_path: updated.permit_file_path, permit_file_name: updated.permit_file_name })
            if (selectedSubmission?.id === id) {
                setSelectedSubmission(prev => prev ? { ...prev, ...updated } : null)
            }

            toast.success('File izin berhasil diunggah')
            return true
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal mengunggah file izin')
            return false
        } finally {
            setIsUploadingPermit(false)
        }
    }

    const handleStartDiscussion = async (id: number) => {
        try {
            setIsStartingDiscussion(true)
            const res = await api.post(`/admin/submissions/${id}/discussion/start`)
            const updated = res.data?.data as Submission

            patchSubmission(id, { discussion_started_at: updated.discussion_started_at })
            if (selectedSubmission?.id === id) {
                setSelectedSubmission(prev => prev ? { ...prev, ...updated } : null)
            }

            toast.success('Forum diskusi berhasil dibuka')
            return true
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal membuka forum diskusi')
            return false
        } finally {
            setIsStartingDiscussion(false)
        }
    }

    const handleOpenChatFromTable = (submission: Submission) => {
        openAdminChat(submission)
    }

    const handleOpenDetail = (submission: Submission) => {
        setSelectedSubmission(submission)
    }

    const handleCloseModal = () => {
        setSelectedSubmission(null)
    }

    const handleMessagesRead = (id: number) => {
        patchSubmission(id, { unread_admin_messages_count: 0 })
        if (selectedSubmission?.id === id) {
            setSelectedSubmission(prev => prev ? { ...prev, unread_admin_messages_count: 0 } : null)
        }
    }

    return (
        <div className="flex flex-col gap-6">

            {/* ── Page Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-neutral-text">Daftar Pendaftar</h1>
                    <p className="mt-0.5 text-sm text-neutral-muted">
                        Kelola semua data pendaftaran magang dan penelitian
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleExportExcel()}
                        disabled={isExporting}
                        className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-green-700 disabled:opacity-50"
                    >
                        <FileSpreadsheet size={15} className={isExporting ? 'animate-pulse' : ''} />
                        Export Excel
                    </button>
                    <button
                        onClick={() => refetch()}
                        disabled={refreshing}
                        className="flex items-center gap-2 rounded-xl border border-neutral-border bg-neutral-card px-4 py-2 text-sm font-semibold text-neutral-subtle shadow-card transition hover:border-primary hover:text-primary"
                    >
                        <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* ── Filters ── */}
            <div className="flex flex-col gap-4 rounded-2xl border border-neutral-border bg-neutral-card p-5 shadow-card lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 items-center gap-3">
                    <div className="relative w-full lg:max-w-md">
                        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-muted" />
                        <input
                            type="text"
                            placeholder="Cari nama, instansi, atau no. surat..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-neutral-border bg-neutral-bg py-2.5 pl-10 pr-4 text-sm font-semibold text-neutral-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 z-10">
                        <Filter size={16} className="text-neutral-muted" />
                        <CustomSelect
                            value={typeFilter}
                            onChange={setTypeFilter}
                            options={[
                                { value: 'all', label: 'Semua Jenis' },
                                { value: 'magang', label: 'Magang' },
                                { value: 'penelitian', label: 'Penelitian' },
                            ]}
                        />
                    </div>
                    <div className="z-10">
                        <CustomSelect
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={[
                                { value: 'all', label: 'Semua Status' },
                                { value: 'pending', label: 'Menunggu' },
                                { value: 'approved', label: 'Diterima' },
                                { value: 'rejected', label: 'Ditolak' },
                            ]}
                        />
                    </div>
                </div>
            </div>

            {/* ── Data Table ── */}
            <div className="overflow-hidden rounded-2xl border border-neutral-border bg-neutral-card shadow-card">
                {loading ? (
                    <div className="py-16 text-center">
                        <RefreshCw size={30} className="mx-auto animate-spin text-primary" />
                        <p className="mt-3 text-sm text-neutral-muted">Memuat data pendaftar...</p>
                    </div>
                ) : paginatedData.length === 0 ? (
                    <div className="py-16 text-center">
                        <p className="text-sm font-semibold text-neutral-muted">Tidak ada data pendaftar yang ditemukan.</p>
                    </div>
                ) : (
                    <SubmissionTable
                        data={paginatedData}
                        onOpenDetail={handleOpenDetail}
                        onOpenChat={handleOpenChatFromTable}
                        onExportSingle={(id) => handleExportExcel(id)}
                    />
                )}

                {/* ── Pagination Footer ── */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-neutral-border px-5 py-4">
                        <span className="text-xs font-semibold text-neutral-muted">
                            Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} dari {filteredData.length} data
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-border text-neutral-text hover:bg-neutral-bg disabled:opacity-50"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <div className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white px-2">
                                {currentPage}
                            </div>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-border text-neutral-text hover:bg-neutral-bg disabled:opacity-50"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Detail */}
            <DetailPendaftarModal
                submission={selectedSubmission}
                onClose={handleCloseModal}
                onStatusChange={handleStatusChange}
                onDatesChange={handleDatesChange}
                onDownload={handleDownload}
                onUploadPermit={handleUploadPermit}
                onStartDiscussion={handleStartDiscussion}
                onMessagesRead={handleMessagesRead}
                isUpdating={isUpdating}
                isDownloading={isDownloading}
                isUploadingPermit={isUploadingPermit}
                isStartingDiscussion={isStartingDiscussion}
            />
        </div>
    )
}

export default ListPendaftarPage