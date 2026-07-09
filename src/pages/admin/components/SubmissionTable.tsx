import { Eye } from 'lucide-react'
import type { Submission } from '../ListPendaftarPage'

interface SubmissionTableProps {
  data: Submission[]
  onOpenDetail: (submission: Submission) => void
}

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

const SubmissionTable = ({ data, onOpenDetail }: SubmissionTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm table-fixed min-w-[850px]">
        <thead>
          <tr className="border-b border-neutral-border bg-neutral-bg text-xs text-neutral-muted">
            <th className="px-5 py-3 text-left font-semibold w-[22%]">Peserta</th>
            <th className="px-5 py-3 text-left font-semibold w-[28%]">Program & Instansi</th>
            <th className="px-5 py-3 text-left font-semibold w-[16%]">Tanggal Kegiatan</th>
            <th className="px-5 py-3 text-left font-semibold w-[14%]">Status</th>
            <th className="px-5 py-3 text-right font-semibold w-[10%]">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(data) && data.length > 0 ? (
            data.map((s, i) => (
              <tr
                key={s.id}
                onClick={() => onOpenDetail(s)}
                className={`cursor-pointer transition-colors hover:bg-primary/5 ${
                  i !== data.length - 1 ? 'border-b border-neutral-border' : ''
                }`}
              >
                <td className="px-5 py-3 truncate">
                  <p className="font-extrabold text-neutral-text truncate">{getName(s.member_1)}</p>
                  <p className="font-mono text-xs text-neutral-muted mt-0.5 truncate">{s.letter_number}</p>
                </td>

                <td className="px-5 py-3 truncate">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold mb-1 ${
                    s.type === 'magang' ? 'bg-primary/10 text-primary' : 'bg-secondary text-neutral-subtle'
                  }`}>
                    {s.type === 'magang' ? 'Magang' : 'Penelitian'}
                  </span>
                  <p className="text-xs font-semibold text-neutral-subtle truncate">{s.institution}</p>
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
                    onClick={(e) => {
                      e.stopPropagation()
                      onOpenDetail(s)
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-bg px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/10"
                  >
                    <Eye size={14} /> Detail
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="py-10 text-center text-sm text-neutral-muted">
                Belum ada data pendaftaran
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default SubmissionTable
