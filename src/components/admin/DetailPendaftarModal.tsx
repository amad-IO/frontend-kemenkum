import { useState, useEffect, useRef } from 'react'
import { X, MapPin, Briefcase, GraduationCap, Calendar, Phone, Mail, FileText, CheckCircle2, XCircle, Download, BookOpenText, Edit2, Upload, MessageCircle, Send } from 'lucide-react'
import { toast } from 'react-toastify'
import type { Submission } from '../../pages/admin/ListPendaftar'
import DateRangePickerField from '../public/forms/DateRangePickerField'
import api from '../../services/api'

type DiscussionMessage = {
  id: number
  sender_type: 'admin' | 'applicant'
  sender_name: string
  message: string
  created_at: string
}

interface Props {
  submission: Submission | null
  onClose: () => void
  onStatusChange: (id: number, status: 'approved' | 'rejected') => void
  onDatesChange: (id: number, start_date: string, end_date: string) => void
  onDownload: (id: number, e: React.MouseEvent) => void
  onUploadPermit: (id: number, file: File, replace?: boolean) => Promise<boolean>
  onStartDiscussion: (id: number) => Promise<boolean>
  chatOpenRequestKey?: number
  onMessagesRead?: (id: number) => void
  isUpdating: boolean
  isDownloading: boolean
  isUploadingPermit: boolean
  isStartingDiscussion: boolean
}

const DetailPendaftarModal = ({
  submission,
  onClose,
  onStatusChange,
  onDatesChange,
  onDownload,
  onUploadPermit,
  onStartDiscussion,
  chatOpenRequestKey,
  onMessagesRead,
  isUpdating,
  isDownloading,
  isUploadingPermit,
  isStartingDiscussion,
}: Props) => {
  const [editStart, setEditStart] = useState('')
  const [editEnd, setEditEnd] = useState('')
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState<DiscussionMessage[]>([])
  const [chatMessage, setChatMessage] = useState('')
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const permitInputRef = useRef<HTMLInputElement>(null)
  const messageListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!submission) return

    setEditStart(submission.start_date.split('T')[0])
    setEditEnd(submission.end_date.split('T')[0])
  }, [submission?.id, submission?.start_date, submission?.end_date])

  useEffect(() => {
    setChatOpen(false)
    setMessages([])
    setChatMessage('')
  }, [submission?.id])

  const parseMember = (memberStr: string | null) => {
    if (!memberStr) return null
    const [nama, nim, email] = memberStr.split('|')
    return { nama, nim, email }
  }

  const ketua = submission ? parseMember(submission.member_1) : null
  const anggota2 = submission ? parseMember(submission.member_2) : null
  const anggota3 = submission ? parseMember(submission.member_3) : null
  const anggotaList = [anggota2, anggota3].filter(Boolean)
  const chatCanStart = Boolean(submission?.document_downloaded_at)
  const chatIsActive = Boolean(submission?.discussion_started_at)
  const chatBadgeLabel = chatIsActive ? 'Aktif' : chatCanStart ? 'Siap' : 'Terkunci'

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })

  const loadMessages = async (silent = false) => {
    if (!submission) return

    try {
      if (!silent) setLoadingMessages(true)
      const res = await api.get(`/admin/submissions/${submission.id}/messages`)
      setMessages(res.data?.data ?? [])
      onMessagesRead?.(submission.id)
    } catch {
      if (!silent) toast.error('Gagal memuat pesan diskusi')
    } finally {
      if (!silent) setLoadingMessages(false)
    }
  }

  useEffect(() => {
    if (!chatOpen || !submission) return

    loadMessages()
    const timer = window.setInterval(() => loadMessages(true), 3000)
    return () => window.clearInterval(timer)
  }, [chatOpen, submission?.id])

  useEffect(() => {
    if (!chatOpen) return
    const list = messageListRef.current
    if (!list) return

    list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' })
  }, [chatOpen, messages])

  const handlePermitChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!submission) return

    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const replace = Boolean(submission.permit_file_path)
    if (replace) {
      const confirmed = window.confirm('File izin sudah tersedia. Upload ulang akan mengganti file sebelumnya. Lanjutkan?')
      if (!confirmed) return
    }

    await onUploadPermit(submission.id, file, replace)
  }

  const handleOpenChat = async () => {
    if (!submission) return

    if (submission.discussion_started_at) {
      setChatOpen(true)
      return
    }

    const ok = await onStartDiscussion(submission.id)
    if (ok) setChatOpen(true)
  }

  useEffect(() => {
    if (!chatOpenRequestKey || !submission) return

    void handleOpenChat()
  }, [chatOpenRequestKey, submission?.id])

  const handleSendMessage = async () => {
    if (!submission) return

    const message = chatMessage.trim()
    if (!message) return

    try {
      setSendingMessage(true)
      const res = await api.post(`/admin/submissions/${submission.id}/messages`, { message })
      setMessages(prev => [...prev, res.data?.data])
      setChatMessage('')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengirim pesan')
    } finally {
      setSendingMessage(false)
    }
  }

  if (!submission) return null

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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={chatOpen ? undefined : onClose} />

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

                  <div className="flex items-start gap-2 text-sm text-neutral-subtle">
                    <Calendar size={15} className="mt-0.5 shrink-0" />
                    <div className="w-full">
                      <DateRangePickerField
                        label=""
                        startDate={editStart}
                        endDate={editEnd}
                        onStartChange={setEditStart}
                        onEndChange={setEditEnd}
                        onConfirm={(start, end) => onDatesChange(submission.id, start, end)}
                        renderTrigger={(openPicker) => (
                          <div className="flex w-full flex-col sm:flex-row sm:items-center sm:justify-between">
                            <button onClick={openPicker} className="text-left text-neutral-text transition hover:text-primary font-medium">
                              {formatDate(submission.start_date)} - {formatDate(submission.end_date)}
                            </button>
                            <button onClick={openPicker} title="Edit Tanggal Kegiatan" className="mt-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-neutral-bg text-primary transition hover:bg-primary/10 sm:mt-0">
                              <Edit2 size={14} />
                            </button>
                          </div>
                        )}
                      />
                    </div>
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

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <input
                    ref={permitInputRef}
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={handlePermitChange}
                  />
                  <button
                    type="button"
                    title="Unduh template izin magang"
                    className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-primary/20 bg-white px-2 text-[11px] font-bold text-primary shadow-sm transition hover:bg-primary hover:text-white"
                  >
                    <Download size={14} />
                    Template
                  </button>
                  <button
                    type="button"
                    title="Upload file izin magang untuk pendaftar"
                    onClick={() => permitInputRef.current?.click()}
                    disabled={isUploadingPermit}
                    className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-primary/20 bg-white px-2 text-[11px] font-bold text-primary shadow-sm transition hover:bg-primary hover:text-white"
                  >
                    <Upload size={14} />
                    {isUploadingPermit ? 'Upload...' : 'Upload'}
                  </button>
                  <button
                    type="button"
                    title="Buka chat diskusi dengan pendaftar"
                    onClick={handleOpenChat}
                    disabled={isStartingDiscussion}
                    className={`flex min-h-10 items-center justify-center gap-1.5 rounded-xl border px-2 text-[11px] font-bold shadow-sm transition ${
                      chatCanStart
                        ? 'border-primary/20 bg-white text-primary hover:bg-primary hover:text-white'
                        : 'border-neutral-border bg-neutral-bg text-neutral-muted hover:border-primary/30 hover:text-primary'
                    }`}
                  >
                    <MessageCircle size={14} />
                    Chat
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${
                      chatIsActive
                        ? 'bg-green-100 text-green-700'
                        : chatCanStart
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-neutral-border text-neutral-subtle'
                    }`}>
                      {chatBadgeLabel}
                    </span>
                  </button>
                </div>
                {submission.permit_file_name && (
                  <p className="mt-2 truncate text-[11px] font-semibold text-neutral-subtle">
                    File izin: <span className="text-primary">{submission.permit_file_name}</span>
                  </p>
                )}
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

      {chatOpen && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
          <section className="absolute bottom-4 right-4 flex h-[min(560px,calc(100vh-2rem))] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-2xl border border-neutral-border bg-white shadow-2xl sm:bottom-6 sm:right-6">
            <div className="flex items-center justify-between border-b border-neutral-border bg-primary px-4 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-white/15">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <p className="text-sm font-extrabold">Forum Diskusi</p>
                  <p className="text-xs font-semibold text-white/75">{ketua?.nama || 'Pendaftar'}</p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Tutup chat"
                onClick={() => setChatOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full text-white transition hover:bg-white/15"
              >
                <X size={20} />
              </button>
            </div>

            <div ref={messageListRef} className="flex-1 space-y-3 overflow-y-auto bg-neutral-bg p-4">
              {loadingMessages && messages.length === 0 ? (
                <p className="text-center text-xs font-semibold text-neutral-muted">Memuat pesan...</p>
              ) : messages.length === 0 ? (
                <div className="rounded-2xl bg-white p-4 text-center text-xs font-semibold text-neutral-muted shadow-sm">
                  Belum ada pesan diskusi.
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      message.sender_type === 'admin'
                        ? 'rounded-br-md bg-primary text-white'
                        : 'rounded-bl-md bg-white text-neutral-text'
                    }`}
                    >
                      <p className={`mb-1 text-xs font-extrabold ${
                        message.sender_type === 'admin' ? 'text-white/80' : 'text-primary'
                      }`}>
                        {message.sender_name}
                      </p>
                      <p className="leading-relaxed">{message.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-neutral-border bg-white p-3">
              <div className="flex items-center gap-2 rounded-2xl border border-neutral-border bg-neutral-card px-3 py-2 focus-within:border-primary">
                <input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendMessage()
                  }}
                  placeholder="Tulis balasan..."
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-neutral-text outline-none placeholder:text-neutral-muted"
                />
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={sendingMessage}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-white transition hover:bg-primary-dark disabled:opacity-50"
                >
                  <Send size={17} />
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default DetailPendaftarModal
