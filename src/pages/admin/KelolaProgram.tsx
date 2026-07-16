import { useState } from 'react'
import { Plus, Edit2, Trash2, RefreshCw, CalendarDays, AlertCircle, ArrowRight, Users } from 'lucide-react'
import { toast } from 'react-toastify'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getAllPeriod, createPeriod, updatePeriod, deletePeriod } from '../../services/programService'
import PeriodModal, { PeriodFormValues } from '../../components/admin/PeriodModal'
import Settings from './Settings'

interface Period {
  id: number
  start_date: string
  end_date: string
  quota: number
  used_quota: number
  remaining_quota: number
  status: 'active' | 'inactive'
  created_at: string
}

const KelolaProgramPage = () => {
  const queryClient = useQueryClient()

  // ── Data Fetching (TanStack Query) ────────────────────────────────────────
  const {
    data: periods = [],
    isLoading: loading,
    isFetching: refreshing,
    refetch,
  } = useQuery({
    queryKey: ['admin-periods'],
    queryFn: async () => {
      const res = await getAllPeriod()
      return (res.data?.data || []) as Period[]
    },
    staleTime: 30_000, // periode jarang berubah, segar 30 detik
    throwOnError: false,
  })

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Delete state
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Toggle status state
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const handleOpenAdd = () => {
    setEditingPeriod(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (period: Period) => {
    setEditingPeriod({
      ...period,
      start_date: period.start_date.split('T')[0],
      end_date: period.end_date.split('T')[0],
    })
    setModalOpen(true)
  }

  const handleSubmit = async (data: PeriodFormValues) => {
    setIsSubmitting(true)
    try {
      if (editingPeriod) {
        await updatePeriod(editingPeriod.id, data)
        toast.success('Periode berhasil diperbarui')
      } else {
        await createPeriod(data)
        toast.success('Periode baru berhasil ditambahkan')
      }
      setModalOpen(false)
      // Invalidate cache agar data ter-refresh dari server
      queryClient.invalidateQueries({ queryKey: ['admin-periods'] })
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
      toast.success('Periode berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['admin-periods'] })
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
      await updatePeriod(period.id, { status: newStatus })
      toast.success(`Status berhasil diubah menjadi ${newStatus === 'active' ? 'Aktif' : 'Tidak Aktif'}`)
      queryClient.invalidateQueries({ queryKey: ['admin-periods'] })
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
      <Settings />
      <div className="border-t border-neutral-border"></div>
            {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-text">Setting Periode Magang</h1>
          <p className="mt-0.5 text-sm text-neutral-muted">
            Atur periode pendaftaran magang beserta kuotanya
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl bg-white border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-600 shadow-sm transition-all hover:bg-neutral-50 hover:text-neutral-900"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
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
        <div>
          {/* Mobile: kartu utuh agar konten tidak terpotong horizontal. */}
          <div className="grid gap-3 md:hidden">
            {periods.map((p) => (
              <article key={p.id} className="overflow-hidden rounded-xl border border-[#dfd3cc] bg-transparent">
                <div className="flex items-start gap-3 px-4 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#b29f97] bg-[#faf7f5] text-[#79594e]">
                    <CalendarDays size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#968780]">Periode Magang</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#322a27]">
                      <span>{formatDate(p.start_date)}</span>
                      <ArrowRight size={12} className="text-[#aa9a93]" />
                      <span>{formatDate(p.end_date)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 border-y border-[#e4d9d3] bg-transparent">
                  <div className="border-r border-[#eee7e3] px-4 py-3">
                    <p className="mb-1.5 text-[9px] font-extrabold uppercase tracking-wider text-[#968780]">Kuota Total</p>
                    <div className="flex items-center gap-2 text-xs text-[#4d403b]">
                      <Users size={14} className="text-[#9a8880]" />
                      <span className="font-bold">{p.quota}</span>
                      <span className="text-[#8c7f79]">orang</span>
                    </div>
                  </div>
                  <div className="border-r border-[#eee7e3] px-4 py-3">
                    <p className="mb-1.5 text-[9px] font-extrabold uppercase tracking-wider text-[#968780]">Sisa Kuota</p>
                    <div className="flex items-center gap-2 text-xs text-[#674237]">
                      <span className="font-extrabold tabular-nums">{p.remaining_quota}</span>
                      <span className="text-[#8c7f79]">orang</span>
                    </div>
                  </div>
                  <div className="px-3 py-3">
                    <p className="mb-1.5 text-[9px] font-extrabold uppercase tracking-wider text-[#968780]">Status</p>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(p)}
                      disabled={togglingId === p.id}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-wide transition-colors disabled:opacity-50 ${
                        p.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-red-50 text-red-700 hover:bg-red-100'
                      }`}
                    >
                      {togglingId === p.id
                        ? <RefreshCw size={10} className="animate-spin" />
                        : <span className={`h-1.5 w-1.5 rounded-full ${p.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />}
                      {p.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 px-4 py-3">
                  <button onClick={() => handleOpenEdit(p)} className="inline-flex h-8 items-center gap-2 rounded-lg border border-[#d7c9c2] bg-transparent px-3 text-[10px] font-bold text-[#674f47]" aria-label={`Edit periode ${formatDate(p.start_date)}`}>
                    <Edit2 size={13} /> Edit
                  </button>
                  <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id} className="inline-flex h-8 items-center gap-2 rounded-lg border border-red-200 bg-transparent px-3 text-[10px] font-bold text-red-600 disabled:opacity-50" aria-label={`Hapus periode ${formatDate(p.start_date)}`}>
                    {deletingId === p.id ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />} Hapus
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Desktop/tablet lebar: baris tabel compact seperti referensi. */}
          <div className="hidden md:block">
            <table className="w-full border-separate border-spacing-y-2 text-sm">
              <thead>
                <tr className="text-left text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#6e625d]">
                  <th className="w-[39%] px-5 pb-2 pt-3">Periode Magang</th>
                  <th className="w-[15%] px-5 pb-2 pt-3">Kuota Total</th>
                  <th className="w-[15%] px-5 pb-2 pt-3">Sisa Kuota</th>
                  <th className="w-[17%] px-5 pb-2 pt-3">Status</th>
                  <th className="w-[14%] px-5 pb-2 pt-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {periods.map((p) => (
                  <tr
                    key={p.id}
                    className="group text-[#322a27] transition-colors"
                  >
                    <td className="rounded-l-xl border-y border-l border-[#dfd3cc] bg-transparent px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[#a89790] text-[#79594e] transition-colors group-hover:border-primary group-hover:bg-primary/5">
                          <CalendarDays size={13} />
                        </div>
                        <div className="flex min-w-0 items-center gap-2.5 text-xs font-bold">
                          <span className="whitespace-nowrap">{formatDate(p.start_date)}</span>
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center text-[#a89790]">
                            <ArrowRight size={11} />
                          </span>
                          <span className="whitespace-nowrap">{formatDate(p.end_date)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="border-y border-[#dfd3cc] bg-transparent px-5 py-3">
                      <div className="inline-flex items-center gap-2 text-xs">
                        <Users size={14} className="text-[#9a8880]" />
                        <span className="font-bold tabular-nums">{p.quota}</span>
                        <span className="font-medium text-[#8c7f79]">orang</span>
                      </div>
                    </td>
                    <td className="border-y border-[#dfd3cc] bg-transparent px-5 py-3">
                      <div className="inline-flex items-center gap-1.5 text-xs">
                        <span className="font-extrabold tabular-nums text-[#674237]">{p.remaining_quota}</span>
                        <span className="font-medium text-[#8c7f79]">orang</span>
                      </div>
                    </td>
                    <td className="border-y border-[#dfd3cc] bg-transparent px-5 py-3">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(p)}
                        disabled={togglingId === p.id}
                        className={`inline-flex min-w-[98px] items-center justify-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                          p.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                        title="Klik untuk mengubah status publikasi"
                      >
                        {togglingId === p.id ? (
                          <RefreshCw size={12} className="animate-spin" />
                        ) : (
                          <span className={`h-1.5 w-1.5 rounded-full ${p.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        )}
                        {p.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                      </button>
                    </td>
                    <td className="rounded-r-xl border-y border-r border-[#dfd3cc] bg-transparent px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-80 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ded6d1] bg-[#faf8f7] text-[#796b65] transition-all hover:border-[#b99b8e] hover:bg-[#f2e7e1] hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          title="Edit periode"
                          aria-label={`Edit periode ${formatDate(p.start_date)} sampai ${formatDate(p.end_date)}`}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deletingId === p.id}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ded6d1] bg-[#faf8f7] text-[#796b65] transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-100 disabled:opacity-50"
                          title="Hapus periode"
                          aria-label={`Hapus periode ${formatDate(p.start_date)} sampai ${formatDate(p.end_date)}`}
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
          
          <div className="mt-3 flex items-start gap-3 rounded-xl border border-[#ded3cd] bg-[#eee6e1] px-4 py-4 sm:px-6">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#dfcec5] text-[#714d41]">
              <AlertCircle size={15} />
            </div>
            <p className="pt-1 text-xs leading-relaxed text-[#674f47]">
              Periode dengan status <strong className="font-bold">Aktif</strong> akan langsung muncul sebagai opsi di form pendaftaran publik. 
              Periode <strong className="font-bold">Tidak Aktif</strong> atau kuotanya penuh tidak akan bisa dipilih.
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
