import { X, MapPin, Briefcase, GraduationCap, Calendar, Phone, Mail, FileText, CheckCircle2, XCircle, Download, BookOpenText } from 'lucide-react'
import type { Submission } from '../ListPendaftarPage'

interface Props {
  submission: Submission | null
  onClose: () => void
  onStatusChange: (id: number, status: 'approved' | 'rejected') => void
  onDownload: (id: number, e: React.MouseEvent) => void
  isUpdating: boolean
  isDownloading: boolean
}

const DetailPendaftarModal = ({
  submission,
  onClose,
  onStatusChange,
  onDownload,
  isUpdating,
  isDownloading,
}: Props) => {
  if (!submission) return null

  const parseMember = (memberStr: string | null) => {
    if (!memberStr) return null
    const [nama, nim, email] = memberStr.split('|')
    return { nama, nim, email }
  }

  const ketua = parseMember(submission.member_1)
  const anggota2 = parseMember(submission.member_2)
  const anggota3 = parseMember(submission.member_3)
  const anggotaList = [anggota2, anggota3].filter(Boolean)

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })

  const StatusBadge = () => {
    const map = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      approved: 'bg-green-100 text-green-700 border-green-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
    }
    const label = { pending: 'Menunggu Review', approved: 'Diterima', rejected: 'Ditolak' }
    return (
      <span className={`rounded-full border px-3 py-1 text-xs font-bold ${map[submission.status]}`}>
        {label[submission.status]}
      </span>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-border px-6 py-5">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-extrabold text-neutral-text">Detail Pendaftar</h2>
            <StatusBadge />
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-neutral-muted transition-colors hover:bg-neutral-bg hover:text-neutral-text"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-6 md:grid-cols-2">

            <div className="flex flex-col gap-6">
              <section>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-muted">Informasi Program</h3>
                <div className="rounded-xl border border-neutral-border bg-neutral-card p-4 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${submission.type === 'magang' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                      {submission.type === 'magang' ? <Briefcase size={20} /> : <BookOpenText size={20} />}
                    </div>
                    <div>
                      <p className="text-sm font-extrabold capitalize text-neutral-text">{submission.type}</p>
                      <p className="text-xs text-neutral-muted">
                        {submission.type === 'magang' ? 'Program Magang' : 'Program Penelitian'}
                      </p>
                    </div>
                  </div>

                  {submission.type === 'penelitian' && submission.research_title && (
                    <div className="mb-4 rounded-lg bg-neutral-bg p-3">
                      <p className="text-[10px] font-semibold text-neutral-subtle">Judul Penelitian</p>
                      <p className="text-sm font-bold text-neutral-text">{submission.research_title}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-neutral-subtle">
                    <Calendar size={15} className="shrink-0" />
                    <span>{formatDate(submission.start_date)} - {formatDate(submission.end_date)}</span>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-muted">Informasi Instansi</h3>
                <div className="rounded-xl border border-neutral-border bg-neutral-card p-4 shadow-sm">
                  <ul className="flex flex-col gap-3">
                    <li className="flex items-start gap-3">
                      <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
                      <div>
                        <p className="text-[10px] font-semibold text-neutral-subtle">Asal Instansi</p>
                        <p className="text-sm font-bold text-neutral-text">{submission.institution}</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <GraduationCap size={16} className="mt-0.5 shrink-0 text-primary" />
                      <div>
                        <p className="text-[10px] font-semibold text-neutral-subtle">Program Studi / Jurusan</p>
                        <p className="text-sm font-bold text-neutral-text">{submission.study_program}</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </section>
            </div>

            <div className="flex flex-col gap-6">
              <section>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-muted">Data Peserta</h3>
                <div className="rounded-xl border border-neutral-border bg-neutral-card p-4 shadow-sm">
                  <div className="mb-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Ketua / Pendaftar Utama</p>
                    <p className="mt-1 text-sm font-extrabold text-neutral-text">{ketua?.nama}</p>
                    <p className="text-xs font-semibold text-neutral-muted">NIM/NISN: {ketua?.nim}</p>

                    <div className="mt-3 flex flex-col gap-1.5 border-t border-neutral-border pt-3">
                      {ketua?.email && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-subtle">
                          <Mail size={14} /> <span>{ketua.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs font-semibold text-neutral-subtle">
                        <Phone size={14} /> <span>{submission.phone_number}</span>
                      </div>
                    </div>
                  </div>

                  {anggotaList.length > 0 && (
                    <div className="border-t border-neutral-border pt-3">
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-subtle">Anggota Kelompok</p>
                      <ul className="flex flex-col gap-2">
                        {anggotaList.map((anggota, i) => (
                          <li key={i} className="rounded-lg bg-neutral-bg p-2 text-xs">
                            <p className="font-bold text-neutral-text">{anggota?.nama}</p>
                            <p className="text-neutral-muted">NIM/NISN: {anggota?.nim}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-muted">Berkas Pendukung</h3>
                <div className="rounded-xl border border-neutral-border bg-neutral-card p-4 shadow-sm">
                  <div className="mb-3 flex items-start gap-3">
                    <FileText size={16} className="mt-0.5 shrink-0 text-primary" />
                    <div>
                      <p className="text-[10px] font-semibold text-neutral-subtle">Nomor Surat Pengantar</p>
                      <p className="font-mono text-sm font-bold text-neutral-text">{submission.letter_number}</p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => onDownload(submission.id, e)}
                    disabled={isDownloading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary bg-primary/5 py-2.5 text-sm font-bold text-primary transition hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Download size={16} />
                    {isDownloading ? 'Mengunduh...' : 'Unduh File ZIP'}
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 rounded-b-2xl border-t border-neutral-border bg-neutral-bg px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-bold text-neutral-subtle transition hover:bg-neutral-border"
          >
            Tutup
          </button>

          {submission.status !== 'rejected' && (
            <button
              onClick={() => onStatusChange(submission.id, 'rejected')}
              disabled={isUpdating}
              className="flex items-center gap-2 rounded-xl bg-white border border-red-200 px-4 py-2 text-sm font-bold text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <XCircle size={16} />
              Tolak
            </button>
          )}

          {submission.status !== 'approved' && (
            <button
              onClick={() => onStatusChange(submission.id, 'approved')}
              disabled={isUpdating}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-card transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCircle2 size={16} />
              Terima Peserta
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default DetailPendaftarModal
