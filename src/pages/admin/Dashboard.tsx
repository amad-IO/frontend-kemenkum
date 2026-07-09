import { useEffect, useState } from 'react'
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
import api from '../../services/api'
import DetailPendaftarModal from './components/DetailPendaftarModal'
import SubmissionTable from './components/SubmissionTable'
import type { Submission } from './ListPendaftar'

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
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0, magang: 0, penelitian: 0 })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const res = await api.get('/admin/submissions')
      const responseData = res.data?.data
      
      // Pengaman: Pastikan data selalu berbentuk array sebelum dimasukkan ke state
      const data: Submission[] = Array.isArray(responseData) 
        ? responseData 
        : (responseData?.data ?? [])
      
      setSubmissions(data)
      setStats({
        total: data.length,
        pending: data.filter((s) => s.status === 'pending').length,
        approved: data.filter((s) => s.status === 'approved').length,
        rejected: data.filter((s) => s.status === 'rejected').length,
        magang: data.filter((s) => s.type === 'magang').length,
        penelitian: data.filter((s) => s.type === 'penelitian').length,
      })
    } catch (error) {
      console.error('Dashboard Fetch Error:', error)
      toast.error('Gagal memuat data Dashboard. Pastikan backend aktif.')
      
      // Jika API error, paksa state kembali ke array kosong agar tidak melempar undefined
      setSubmissions([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleStatusChange = async (id: number, status: 'approved' | 'rejected') => {
    try {
      setIsUpdating(true)
      await api.patch(`/admin/submissions/${id}/status`, { status })
      
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status } : s))
      if (selectedSubmission?.id === id) {
        setSelectedSubmission(prev => prev ? { ...prev, status } : null)
      }
      
      toast.success(`Status permohonan berhasil diperbarui`)
      fetchData(true)
    } catch {
      toast.error('Gagal mengubah status permohonan')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDatesChange = async (id: number, start_date: string, end_date: string) => {
    try {
      setIsUpdating(true)
      await api.patch(`/admin/submissions/${id}/dates`, { start_date, end_date })
      
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, start_date, end_date } : s))
      
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
      toast.success('Berkas berhasil diunduh')
    } catch {
      toast.error('Gagal mengunduh berkas ZIP.')
    } finally {
      setIsDownloading(false)
    }
  }

  useEffect(() => { 
    fetchData() 
  }, [])

  // Pengaman tambahan: Pastikan submissions divalidasi array sebelum di-slice
  const recentFive = Array.isArray(submissions) ? submissions.slice(0, 5) : []

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
          <p className="mt-0.5 text-sm text-neutral-muted">Ringkasan pendaftaran Magang & Penelitian</p>
        </div>
        <button 
          onClick={() => fetchData(true)} 
          disabled={refreshing} 
          className="flex items-center gap-2 rounded-xl border border-neutral-border bg-neutral-card px-4 py-2 text-sm font-semibold text-neutral-subtle shadow-card transition hover:border-primary hover:text-primary"
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
            {[{ label: 'Menunggu', val: stats.pending, color: 'bg-yellow-400' }, { label: 'Diterima', val: stats.approved, color: 'bg-green-500' }, { label: 'Ditolak', val: stats.rejected, color: 'bg-red-400' }].map(({ label, val, color }) => (
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
            <a href="/admin/setting-form" className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/25">
              <Download size={15} /> Setting Form
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
        <SubmissionTable data={recentFive} onOpenDetail={(s) => setSelectedSubmission(s)} />
      </div>

      {/* Modal Detail Pendaftar */}
      <DetailPendaftarModal 
        submission={selectedSubmission} 
        onClose={() => setSelectedSubmission(null)}
        onStatusChange={handleStatusChange} 
        onDatesChange={handleDatesChange}
        onDownload={handleDownload}
        isUpdating={isUpdating} 
        isDownloading={isDownloading}
      />
    </div>
  )
}

export default Dashboard