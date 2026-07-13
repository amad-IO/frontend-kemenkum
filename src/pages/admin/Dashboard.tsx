import { useState } from 'react'
import { 
  Users, 
  ClipboardList, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp, 
  Download, 
  RefreshCw 
} from 'lucide-react'
import { toast } from 'react-toastify'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import DetailPendaftarModal from '../../components/admin/DetailPendaftarModal'
import SubmissionTable from '../../components/admin/SubmissionTable'
import type { Submission } from './ListPendaftar'
import { useAdminChat } from '../../contexts/AdminChatContext'

interface Stats {
  total: number
  pending: number
  approved: number
  rejected: number
  magang: number
  penelitian: number
}

// ─── Stat Card Component ──────────────────────────────────────────────────────

const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string
  value: number | string
  icon: React.ElementType
  color: string
  sub?: string
}) => (
  <div className="flex items-center gap-4 rounded-2xl border border-neutral-border bg-neutral-card p-5 shadow-card">
    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-extrabold text-neutral-text">{value}</p>
      <p className="text-xs font-semibold text-neutral-muted">{label}</p>
      {sub && <p className="mt-0.5 text-[10px] text-neutral-muted">{sub}</p>}
    </div>
  </div>
)

// ─── Main Dashboard Component ─────────────────────────────────────────────────

const Dashboard = () => {
  const { openAdminChat } = useAdminChat()
  const queryClient = useQueryClient()

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
    staleTime: 8_000,
    refetchInterval: 10_000,
    refetchIntervalInBackground: false,
    throwOnError: false,
  })

  const [localPatches, setLocalPatches] = useState<Record<number, Partial<Submission>>>({})

  const patchSubmission = (id: number, patch: Partial<Submission>) => {
    setLocalPatches(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }))
  }

  const submissions: Submission[] = rawSubmissions.map(s => ({ ...s, ...(localPatches[s.id] ?? {}) }))

  const stats: Stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
    magang: submissions.filter(s => s.type === 'magang').length,
    penelitian: submissions.filter(s => s.type === 'penelitian').length,
  }

  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isUploadingPermit, setIsUploadingPermit] = useState(false)
  const [isStartingDiscussion, setIsStartingDiscussion] = useState(false)

  const handleStatusChange = async (id: number, status: 'approved' | 'rejected') => {
    try {
      setIsUpdating(true)
      await api.patch(`/admin/submissions/${id}/status`, { status })
      patchSubmission(id, { status })
      if (selectedSubmission?.id === id) {
        setSelectedSubmission(prev => prev ? { ...prev, status } : null)
      }
      toast.success(`Status permohonan berhasil diperbarui`)
      queryClient.invalidateQueries({ queryKey: ['admin-submissions'] })
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengubah status permohonan')
    } finally {
      setIsUpdating(false)
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
      const res = await api.get(`/admin/submissions/${id}/download`, { responseType: 'blob' })
      const submission = submissions.find(s => s.id === id)
      let filename = `permohonan-${id}.zip`
      if (submission) {
        const ketua = submission.member_1.split('|')[0] || 'ketua'
        const kampus = submission.institution || 'kampus'
        filename = `permohonan_${ketua.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${kampus.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.zip`
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
    } catch {
      toast.error('Gagal mengunduh berkas ZIP.')
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
    queryClient.setQueryData(['admin-submissions'], (old: Submission[]) => {
      if (!old) return old
      return old.map(s => (s.id === id ? { ...s, unread_admin_messages_count: 0 } : s))
    })
    if (selectedSubmission?.id === id) {
      setSelectedSubmission(prev => prev ? { ...prev, unread_admin_messages_count: 0 } : null)
    }
  }

  const recentFive = submissions.slice(0, 5)

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw size={28} className="animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-text">Dashboard</h1>
          <p className="mt-0.5 text-sm text-neutral-muted">Ringkasan pendaftaran Magang &amp; Penelitian</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-xl border border-neutral-border bg-neutral-card px-4 py-2.5 text-sm font-semibold text-neutral-subtle shadow-card transition hover:border-primary hover:text-primary"
        >
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Pendaftaran" value={stats.total} icon={ClipboardList} color="bg-primary" />
        <StatCard label="Menunggu Review" value={stats.pending} icon={Clock} color="bg-yellow-400" sub="Perlu ditindaklanjuti" />
        <StatCard label="Diterima" value={stats.approved} icon={CheckCircle2} color="bg-green-500" />
        <StatCard label="Ditolak" value={stats.rejected} icon={XCircle} color="bg-red-400" />
      </div>

      {/* ── Split Cards Row ── */}
      <div className="grid gap-4 lg:grid-cols-3">

        {/* Jenis Program Card */}
        <div className="rounded-2xl border border-neutral-border bg-neutral-card p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-text">Jenis Program</h2>
            <TrendingUp size={16} className="text-primary" />
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-semibold text-neutral-subtle">Magang</span>
                <span className="font-bold text-primary">{stats.magang}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-neutral-bg">
                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: stats.total ? `${(stats.magang / stats.total) * 100}%` : '0%' }} />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-semibold text-neutral-subtle">Penelitian</span>
                <span className="font-bold text-secondary">{stats.penelitian}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-neutral-bg">
                <div className="h-full rounded-full bg-secondary transition-all duration-500" style={{ width: stats.total ? `${(stats.penelitian / stats.total) * 100}%` : '0%' }} />
              </div>
            </div>
          </div>
          <div className="mt-5 flex gap-4 border-t border-neutral-border pt-4">
            <div className="text-center flex-1">
              <p className="text-xl font-extrabold text-primary">{stats.magang}</p>
              <p className="text-[10px] font-semibold text-neutral-muted">Magang</p>
            </div>
            <div className="w-px bg-neutral-border" />
            <div className="text-center flex-1">
              <p className="text-xl font-extrabold text-neutral-subtle">{stats.penelitian}</p>
              <p className="text-[10px] font-semibold text-neutral-muted">Penelitian</p>
            </div>
          </div>
        </div>

        {/* Status Overview Card */}
        <div className="rounded-2xl border border-neutral-border bg-neutral-card p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-text">Status Overview</h2>
            <Users size={16} className="text-primary" />
          </div>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Menunggu', val: stats.pending, color: 'bg-yellow-400' },
              { label: 'Diterima', val: stats.approved, color: 'bg-green-500' },
              { label: 'Ditolak', val: stats.rejected, color: 'bg-red-400' },
            ].map(({ label, val, color }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${color}`} />
                <span className="flex-1 text-xs font-semibold text-neutral-subtle">{label}</span>
                <span className="text-sm font-extrabold text-neutral-text">
                  {val} <span className="text-xs text-neutral-muted font-normal">({stats.total ? Math.round((val / stats.total) * 100) : 0}%)</span>
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex h-2 overflow-hidden rounded-full">
            <div className="bg-yellow-400 transition-all" style={{ width: `${stats.total ? (stats.pending / stats.total) * 100 : 0}%` }} />
            <div className="bg-green-500 transition-all" style={{ width: `${stats.total ? (stats.approved / stats.total) * 100 : 0}%` }} />
            <div className="bg-red-400 transition-all" style={{ width: `${stats.total ? (stats.rejected / stats.total) * 100 : 0}%` }} />
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="rounded-2xl border border-neutral-border bg-primary p-5 shadow-card text-white">
          <h2 className="mb-4 text-sm font-bold">Aksi Cepat</h2>
          <div className="flex flex-col gap-2">
            <a href="/admin/pendaftar" className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/25">
              <Users size={15} /> Lihat Semua Pendaftar
            </a>
            <a href="/admin/pendaftar?status=pending" className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/25">
              <Clock size={15} /> Review Pending ({stats.pending})
            </a>
            <a href="/admin/program" className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/25">
              <Download size={15} /> Kelola Periode Magang
            </a>
          </div>
        </div>
      </div>

      {/* ── Recent Submissions Table Container ── */}
      <div className="overflow-hidden rounded-2xl border border-neutral-border bg-neutral-card shadow-card">
        <div className="flex items-center justify-between border-b border-neutral-border px-5 py-4">
          <h2 className="text-sm font-bold text-neutral-text">Pendaftaran Terbaru</h2>
          <a href="/admin/pendaftar" className="text-xs font-semibold text-primary hover:underline">Lihat semua →</a>
        </div>

        {/* Memanggil Reusable Table Component */}
        <SubmissionTable
          data={recentFive}
          onOpenDetail={handleOpenDetail}
          onOpenChat={handleOpenChatFromTable}
        />
      </div>

      {/* Modal Detail Pendaftar */}
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

export default Dashboard
