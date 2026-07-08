import { useState, useEffect, useMemo } from 'react'
import { Search, Filter, RefreshCw, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '../../services/api'
import DetailPendaftarModal from '../../components/admin/DetailPendaftarModal'

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
  created_at: string
  position?: { position_name: string }
}

const ListPendaftar = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Pagination client-side (Karena API mungkin mengembalikan semua data dalam array jika dimodifikasi, tapi asumsikan kita punya array data utuh)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Modal State
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    
    try {
      const res = await api.get('/admin/submissions')
      const responseData = res.data?.data
      const data: Submission[] = Array.isArray(responseData) 
        ? responseData 
        : (responseData?.data ?? [])
      
      setSubmissions(data)
    } catch {
      toast.error('Gagal memuat daftar pendaftar')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

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
      
      // Update local state
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status } : s))
      
      // Update modal state if open
      if (selectedSubmission?.id === id) {
        setSelectedSubmission(prev => prev ? { ...prev, status } : null)
      }
      
      toast.success(`Status permohonan berhasil diubah menjadi ${status === 'approved' ? 'Diterima' : 'Ditolak'}`)
    } catch {
      toast.error('Gagal mengubah status permohonan')
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
        
        // Clean characters for filename safety
        const cleanKetua = ketua.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
        const cleanKampus = kampus.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
        
        filename = `permohonan_${cleanKetua}_${cleanKampus}.zip`
      }
      
      // Create object url and download
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Berkas berhasil diunduh')
    } catch {
      toast.error('Gagal mengunduh berkas ZIP. File mungkin tidak ditemukan.')
    } finally {
      setIsDownloading(false)
    }
  }

  // UI Helpers
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

  const getName = (member1: string) => member1.split('|')[0] ?? '-'

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
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-xl border border-neutral-border bg-neutral-card px-4 py-2 text-sm font-semibold text-neutral-subtle shadow-card transition hover:border-primary hover:text-primary"
        >
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
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
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-neutral-muted" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-neutral-border bg-white px-3 py-2.5 text-sm font-semibold text-neutral-text outline-none focus:border-primary"
            >
              <option value="all">Semua Jenis</option>
              <option value="magang">Magang</option>
              <option value="penelitian">Penelitian</option>
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-neutral-border bg-white px-3 py-2.5 text-sm font-semibold text-neutral-text outline-none focus:border-primary"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="approved">Diterima</option>
            <option value="rejected">Ditolak</option>
          </select>
        </div>
      </div>

      {/* ── Data Table ── */}
      <div className="rounded-2xl border border-neutral-border bg-neutral-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-border bg-neutral-bg text-xs text-neutral-muted">
                <th className="px-5 py-3 text-left font-semibold">Peserta</th>
                <th className="px-5 py-3 text-left font-semibold">Program & Instansi</th>
                <th className="px-5 py-3 text-left font-semibold">Tanggal Kegiatan</th>
                <th className="px-5 py-3 text-left font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <RefreshCw size={30} className="mx-auto animate-spin text-primary" />
                    <p className="mt-3 text-sm text-neutral-muted">Memuat data pendaftar...</p>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <p className="text-sm font-semibold text-neutral-muted">Tidak ada data pendaftar yang ditemukan.</p>
                  </td>
                </tr>
              ) : (
                paginatedData.map((s, i) => (
                  <tr
                    key={s.id}
                    onClick={() => setSelectedSubmission(s)}
                    className={`cursor-pointer transition-colors hover:bg-primary/5 ${i !== paginatedData.length - 1 ? 'border-b border-neutral-border' : ''}`}
                  >
                    <td className="px-5 py-3">
                      <p className="font-extrabold text-neutral-text">{getName(s.member_1)}</p>
                      <p className="font-mono text-xs text-neutral-muted mt-0.5">{s.letter_number}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold mb-1 ${s.type === 'magang' ? 'bg-primary/10 text-primary' : 'bg-secondary text-neutral-subtle'}`}>
                        {s.type === 'magang' ? 'Magang' : 'Penelitian'}
                      </span>
                      <p className="text-xs font-semibold text-neutral-subtle">{s.institution}</p>
                    </td>
                    <td className="px-5 py-3 text-xs text-neutral-subtle">
                      <p>{new Date(s.start_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} -</p>
                      <p>{new Date(s.end_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedSubmission(s); }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-bg px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/10"
                      >
                        <Eye size={14} /> Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
        onClose={() => setSelectedSubmission(null)}
        onStatusChange={handleStatusChange}
        onDownload={handleDownload}
        isUpdating={isUpdating}
        isDownloading={isDownloading}
      />
    </div>
  )
}

export default ListPendaftar
