import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, RefreshCw, CalendarDays, AlertCircle } from 'lucide-react'
import { toast } from 'react-toastify'
import { getAllPeriod, createPeriod, updatePeriod, deletePeriod } from '../../services/programService'
import PeriodModal, { PeriodFormValues } from './components/PeriodModal'

interface Period {
  id: number
  start_date: string
  end_date: string
  quota: number
  status: 'active' | 'inactive'
  created_at: string
}

const KelolaProgramPage = () => {
  const [periods, setPeriods] = useState<Period[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Delete state
  const [deletingId, setDeletingId] = useState<number | null>(null)
  
  // Toggle status state
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    
    try {
      const res = await getAllPeriod()
      const data = res.data?.data || []
      setPeriods(data)
    } catch {
      toast.error('Gagal memuat daftar periode magang')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleOpenAdd = () => {
    setEditingPeriod(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (period: Period) => {
    setEditingPeriod(period)
    setModalOpen(true)
  }

  const handleSubmit = async (data: PeriodFormValues) => {
    setIsSubmitting(true)
    try {
      if (editingPeriod) {
        // Edit
        const res = await updatePeriod(editingPeriod.id, data)
        const updated = res.data.data
        setPeriods((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
        toast.success('Periode berhasil diperbarui')
      } else {
        // Create
        const res = await createPeriod(data)
        const created = res.data.data
        setPeriods((prev) => [created, ...prev])
        toast.success('Periode baru berhasil ditambahkan')
      }
      setModalOpen(false)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan periode')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus periode ini? Tindakan ini tidak dapat dibatalkan.')) return
    
    setDeletingId(id)
    try {
      await deletePeriod(id)
      setPeriods((prev) => prev.filter((p) => p.id !== id))
      toast.success('Periode berhasil dihapus')
    } catch {
      toast.error('Gagal menghapus periode')
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleStatus = async (period: Period) => {
    setTogglingId(period.id)
    const newStatus = period.status === 'active' ? 'inactive' : 'active'
    try {
      const res = await updatePeriod(period.id, { status: newStatus })
      const updated = res.data.data
      setPeriods((prev) => prev.map((p) => (p.id === period.id ? updated : p)))
      toast.success(`Status berhasil diubah menjadi ${newStatus === 'active' ? 'Aktif' : 'Tidak Aktif'}`)
    } catch {
      toast.error('Gagal mengubah status periode')
    } finally {
      setTogglingId(null)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric'
    })
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-text">Kelola Periode Magang</h1>
          <p className="mt-0.5 text-sm text-neutral-muted">
            Atur periode pendaftaran magang beserta kuotanya
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-neutral-border bg-neutral-card px-4 py-2 text-sm font-semibold text-neutral-subtle shadow-card transition hover:border-primary hover:text-primary"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-card transition hover:bg-primary-dark"
          >
            <Plus size={16} />
            Tambah Periode
          </button>
        </div>
      </div>

      {/* ── Content Area ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-border bg-neutral-card py-24 shadow-card">
          <RefreshCw size={40} className="mb-4 animate-spin text-primary" />
          <p className="text-sm font-semibold text-neutral-muted">Memuat data periode...</p>
        </div>
      ) : periods.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-primary/20 bg-primary/5 px-6 py-24 text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-xl shadow-primary/10">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CalendarDays size={32} />
            </div>
          </div>
          <h3 className="mb-2 text-2xl font-extrabold text-neutral-text">Belum ada periode magang</h3>
          <p className="mx-auto mb-8 max-w-md text-sm text-neutral-muted leading-relaxed">
            Anda belum menambahkan periode pendaftaran magang apa pun. Segera buat periode pertama agar calon pendaftar dapat mulai memilih jadwal magang mereka.
          </p>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/40 active:translate-y-0"
          >
            <Plus size={18} />
            Buat Periode Baru
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-border bg-neutral-card shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-border bg-neutral-bg text-xs text-neutral-muted">
                  <th className="px-6 py-4 text-left font-semibold">Periode (Tanggal)</th>
                  <th className="px-6 py-4 text-left font-semibold">Kuota Total</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                  <th className="px-6 py-4 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {periods.map((p, i) => (
                  <tr
                    key={p.id}
                    className={`transition-colors hover:bg-neutral-bg ${i !== periods.length - 1 ? 'border-b border-neutral-border' : ''}`}
                  >
                    <td className="px-6 py-4 font-extrabold text-neutral-text">
                      {formatDate(p.start_date)} - {formatDate(p.end_date)}
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-neutral-text">
                      {p.quota} Orang
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(p)}
                        disabled={togglingId === p.id}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 ${
                          p.status === 'active'
                            ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                            : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-200'
                        }`}
                        title="Klik untuk mengubah status"
                      >
                        {togglingId === p.id ? (
                          <RefreshCw size={10} className="animate-spin" />
                        ) : (
                          <span className={`h-1.5 w-1.5 rounded-full ${p.status === 'active' ? 'bg-green-500' : 'bg-neutral-400'}`} />
                        )}
                        {p.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-bg text-neutral-subtle transition hover:bg-primary/10 hover:text-primary"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deletingId === p.id}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-bg text-neutral-subtle transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                          title="Hapus"
                        >
                          {deletingId === p.id ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-start gap-2 border-t border-neutral-border bg-neutral-bg px-6 py-3">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-primary" />
            <p className="text-xs text-neutral-subtle">
              Periode dengan status <span className="font-bold">Aktif</span> akan langsung muncul sebagai opsi di form pendaftaran publik. 
              Periode <span className="font-bold">Tidak Aktif</span> atau kuotanya penuh tidak akan bisa dipilih.
            </p>
          </div>
        </div>
      )}

      <PeriodModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingPeriod || undefined}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}

export default KelolaProgramPage
