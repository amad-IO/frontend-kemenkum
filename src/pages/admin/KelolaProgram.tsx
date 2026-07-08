import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, RefreshCw, BriefcaseBusiness, AlertCircle } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '../../services/api'
import PositionModal, { PositionFormValues } from '../../components/admin/PositionModal'

interface Position {
  id: number
  position_name: string
  status: 'active' | 'inactive'
  created_at: string
}

const KelolaProgram = () => {
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPosition, setEditingPosition] = useState<Position | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Delete state
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    
    try {
      const res = await api.get('/admin/positions')
      const data = res.data?.data || []
      setPositions(data)
    } catch {
      toast.error('Gagal memuat daftar posisi magang')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleOpenAdd = () => {
    setEditingPosition(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (pos: Position) => {
    setEditingPosition(pos)
    setModalOpen(true)
  }

  const handleSubmit = async (data: PositionFormValues) => {
    setIsSubmitting(true)
    try {
      if (editingPosition) {
        // Edit
        const res = await api.patch(`/admin/positions/${editingPosition.id}`, data)
        const updated = res.data.data
        setPositions((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
        toast.success('Posisi berhasil diperbarui')
      } else {
        // Create
        const res = await api.post('/admin/positions', data)
        const created = res.data.data
        // Add to beginning of array
        setPositions((prev) => [created, ...prev])
        toast.success('Posisi baru berhasil ditambahkan')
      }
      setModalOpen(false)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan posisi')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus posisi ini? Tindakan ini tidak dapat dibatalkan.')) return
    
    setDeletingId(id)
    try {
      await api.delete(`/admin/positions/${id}`)
      setPositions((prev) => prev.filter((p) => p.id !== id))
      toast.success('Posisi berhasil dihapus')
    } catch {
      toast.error('Gagal menghapus posisi')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-text">Kelola Program</h1>
          <p className="mt-0.5 text-sm text-neutral-muted">
            Atur posisi magang yang tersedia untuk pendaftar
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
            Tambah Posisi
          </button>
        </div>
      </div>

      {/* ── Empty State & Table ── */}
      <div className="rounded-2xl border border-neutral-border bg-neutral-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-border bg-neutral-bg text-xs text-neutral-muted">
                <th className="px-6 py-4 text-left font-semibold">Nama Posisi</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-left font-semibold">Tgl Dibuat</th>
                <th className="px-6 py-4 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <RefreshCw size={30} className="mx-auto animate-spin text-primary" />
                    <p className="mt-3 text-sm text-neutral-muted">Memuat data posisi...</p>
                  </td>
                </tr>
              ) : positions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-bg">
                      <BriefcaseBusiness size={24} className="text-neutral-subtle" />
                    </div>
                    <p className="text-sm font-bold text-neutral-text">Belum ada posisi magang</p>
                    <p className="mb-4 mt-1 text-xs text-neutral-muted">
                      Tambahkan posisi magang agar pendaftar dapat memilihnya di form.
                    </p>
                    <button
                      onClick={handleOpenAdd}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/20"
                    >
                      <Plus size={14} /> Tambah Posisi Pertama
                    </button>
                  </td>
                </tr>
              ) : (
                positions.map((p, i) => (
                  <tr
                    key={p.id}
                    className={`transition-colors hover:bg-neutral-bg ${i !== positions.length - 1 ? 'border-b border-neutral-border' : ''}`}
                  >
                    <td className="px-6 py-4 font-extrabold text-neutral-text">
                      {p.position_name}
                    </td>
                    <td className="px-6 py-4">
                      {p.status === 'active' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-bold text-neutral-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                          Tidak Aktif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-neutral-subtle font-mono">
                      {new Date(p.created_at).toLocaleDateString('id-ID', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
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
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {positions.length > 0 && (
          <div className="flex items-start gap-2 border-t border-neutral-border bg-neutral-bg px-6 py-3">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-primary" />
            <p className="text-xs text-neutral-subtle">
              Posisi dengan status <span className="font-bold">Aktif</span> akan langsung muncul sebagai opsi di form pendaftaran publik. 
              Posisi <span className="font-bold">Tidak Aktif</span> akan disembunyikan tanpa perlu menghapus datanya.
            </p>
          </div>
        )}
      </div>

      <PositionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingPosition || undefined}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}

export default KelolaProgram
