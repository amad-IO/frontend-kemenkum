import { useEffect, useState } from 'react'
import {
  Users,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Download,
  RefreshCw,
} from 'lucide-react'
import api from '../../services/api'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Submission {
  id: number
  type: 'magang' | 'penelitian'
  institution: string
  member_1: string
  letter_number: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  position?: { position_name: string }
}

interface Stats {
  total: number
  pending: number
  approved: number
  rejected: number
  magang: number
  penelitian: number
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

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

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: Submission['status'] }) => {
  const map = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  }
  const label = { pending: 'Menunggu', approved: 'Diterima', rejected: 'Ditolak' }
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${map[status]}`}>
      {label[status]}
    </span>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const Dashboard = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0, magang: 0, penelitian: 0 })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const res = await api.get<{ data: Submission[] }>('/admin/submissions')
      const data = res.data?.data ?? (res.data as unknown as Submission[])
      setSubmissions(data)
      setStats({
        total: data.length,
        pending: data.filter((s) => s.status === 'pending').length,
        approved: data.filter((s) => s.status === 'approved').length,
        rejected: data.filter((s) => s.status === 'rejected').length,
        magang: data.filter((s) => s.type === 'magang').length,
        penelitian: data.filter((s) => s.type === 'penelitian').length,
      })
    } catch {
      // Gunakan dummy jika API belum tersedia
      const dummy: Submission[] = [
        { id: 1, type: 'magang', institution: 'Universitas Indonesia', member_1: 'Ahmad Fauzi|2021010001|ahmad@ui.ac.id', letter_number: 'UI/2026/001', status: 'pending', created_at: '2026-07-01', position: { position_name: 'Hukum Perdata' } },
        { id: 2, type: 'penelitian', institution: 'Universitas Gadjah Mada', member_1: 'Sari Dewi|2020020002|sari@ugm.ac.id', letter_number: 'UGM/2026/012', status: 'approved', created_at: '2026-07-02' },
        { id: 3, type: 'magang', institution: 'Universitas Brawijaya', member_1: 'Budi Santoso|2021030003|budi@ub.ac.id', letter_number: 'UB/2026/008', status: 'pending', created_at: '2026-07-03', position: { position_name: 'Administrasi' } },
        { id: 4, type: 'penelitian', institution: 'Institut Teknologi Bandung', member_1: 'Rina Putri|2020040004|rina@itb.ac.id', letter_number: 'ITB/2026/005', status: 'rejected', created_at: '2026-07-04' },
        { id: 5, type: 'magang', institution: 'Universitas Airlangga', member_1: 'Dani Kusuma|2021050005|dani@unair.ac.id', letter_number: 'UNAIR/2026/003', status: 'approved', created_at: '2026-07-05', position: { position_name: 'Hukum Pidana' } },
      ]
      setSubmissions(dummy)
      setStats({ total: 5, pending: 2, approved: 2, rejected: 1, magang: 3, penelitian: 2 })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const getName = (member1: string) => member1.split('|')[0] ?? '-'

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
          <p className="mt-0.5 text-sm text-neutral-muted">
            Ringkasan pendaftaran Magang & Penelitian
          </p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-xl border border-neutral-border bg-neutral-card px-4 py-2 text-sm font-semibold text-neutral-subtle shadow-card transition hover:border-primary hover:text-primary"
        >
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Pendaftaran" value={stats.total} icon={ClipboardList} color="bg-primary" />
        <StatCard label="Menunggu Review" value={stats.pending} icon={Clock} color="bg-yellow-400" sub="Perlu ditindaklanjuti" />
        <StatCard label="Diterima" value={stats.approved} icon={CheckCircle2} color="bg-green-500" />
        <StatCard label="Ditolak" value={stats.rejected} icon={XCircle} color="bg-red-400" />
      </div>

      {/* ── Row 2: Split cards ── */}
      <div className="grid gap-4 lg:grid-cols-3">

        {/* Jenis Program */}
        <div className="rounded-2xl border border-neutral-border bg-neutral-card p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-text">Jenis Program</h2>
            <TrendingUp size={16} className="text-primary" />
          </div>
          <div className="flex flex-col gap-3">
            {/* Magang */}
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-semibold text-neutral-subtle">Magang</span>
                <span className="font-bold text-primary">{stats.magang}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-neutral-bg">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: stats.total ? `${(stats.magang / stats.total) * 100}%` : '0%' }}
                />
              </div>
            </div>
            {/* Penelitian */}
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-semibold text-neutral-subtle">Penelitian</span>
                <span className="font-bold text-secondary">{stats.penelitian}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-neutral-bg">
                <div
                  className="h-full rounded-full bg-secondary transition-all duration-500"
                  style={{ width: stats.total ? `${(stats.penelitian / stats.total) * 100}%` : '0%' }}
                />
              </div>
            </div>
          </div>

          {/* Summary number */}
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

        {/* Status overview */}
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
                <span className="text-sm font-extrabold text-neutral-text">{val}</span>
                <span className="text-xs text-neutral-muted">
                  ({stats.total ? Math.round((val / stats.total) * 100) : 0}%)
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

        {/* Quick actions */}
        <div className="rounded-2xl border border-neutral-border bg-primary p-5 shadow-card text-white">
          <h2 className="mb-4 text-sm font-bold">Aksi Cepat</h2>
          <div className="flex flex-col gap-2">
            <a
              href="/admin/pendaftar"
              className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/25"
            >
              <Users size={15} />
              Lihat Semua Pendaftar
            </a>
            <a
              href="/admin/pendaftar?status=pending"
              className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/25"
            >
              <Clock size={15} />
              Review Pending ({stats.pending})
            </a>
            <a
              href="/admin/setting-form"
              className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/25"
            >
              <Download size={15} />
              Setting Form
            </a>
          </div>
        </div>
      </div>

      {/* ── Recent Submissions Table ── */}
      <div className="rounded-2xl border border-neutral-border bg-neutral-card shadow-card">
        <div className="flex items-center justify-between border-b border-neutral-border px-5 py-4">
          <h2 className="text-sm font-bold text-neutral-text">Pendaftaran Terbaru</h2>
          <a
            href="/admin/pendaftar"
            className="text-xs font-semibold text-primary hover:underline"
          >
            Lihat semua →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-border bg-neutral-bg text-xs text-neutral-muted">
                <th className="px-5 py-3 text-left font-semibold">Nama</th>
                <th className="px-5 py-3 text-left font-semibold">Instansi</th>
                <th className="px-5 py-3 text-left font-semibold">Jenis</th>
                <th className="px-5 py-3 text-left font-semibold">No. Surat</th>
                <th className="px-5 py-3 text-left font-semibold">Tanggal</th>
                <th className="px-5 py-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentFive.map((s, i) => (
                <tr
                  key={s.id}
                  className={`transition-colors hover:bg-neutral-bg ${i !== recentFive.length - 1 ? 'border-b border-neutral-border' : ''}`}
                >
                  <td className="px-5 py-3 font-semibold text-neutral-text">
                    {getName(s.member_1)}
                  </td>
                  <td className="px-5 py-3 text-neutral-subtle">{s.institution}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${s.type === 'magang' ? 'bg-primary/10 text-primary' : 'bg-secondary text-neutral-subtle'}`}>
                      {s.type === 'magang' ? 'Magang' : 'Penelitian'}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-neutral-muted">
                    {s.letter_number}
                  </td>
                  <td className="px-5 py-3 text-neutral-muted">
                    {new Date(s.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={s.status} />
                  </td>
                </tr>
              ))}
              {recentFive.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-neutral-muted">
                    Belum ada data pendaftaran
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
