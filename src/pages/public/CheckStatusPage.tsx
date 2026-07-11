import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, ClipboardEdit, FileSearch, CheckSquare, MessageCircle, Megaphone, Check, Download, Send, X } from 'lucide-react'
import Footer from '../../components/public/layout/Footer'
import HeroLayout from '../../components/public/layout/HeroLayout'
import checkStatusImage from '../../assets/05.webp'

import api from '../../services/api'
import { toast } from 'react-toastify'

const steps = [
  { id: 1, title: 'Pendaftaran', description: 'Berkas berhasil dikirim', icon: ClipboardEdit },
  { id: 2, title: 'Verifikasi', description: 'Verifikasi kelengkapan data peserta', icon: CheckSquare },
  { id: 3, title: 'Review Berkas', description: 'Admin sedang meninjau dokumen pendaftaran', icon: FileSearch },
  { id: 4, title: 'Forum Diskusi', description: 'Sesi QnA dengan Admin', icon: MessageCircle },
  { id: 5, title: 'Pengumuman', description: 'Hasil akhir & Dokumen Izin Magang', icon: Megaphone },
]

type ApplicantAccount = {
  name: string
  nim: string
  email: string
}

type EffectiveStage = 'submitted' | 'verification' | 'document_review' | 'discussion' | 'announcement'
type FinalStatus = 'pending' | 'approved' | 'rejected'
type ProgramType = 'magang' | 'penelitian'
type DiscussionMessage = {
  id: number
  sender_type: 'admin' | 'applicant'
  sender_name: string
  message: string
  created_at: string
}

type StoredStatusAccount = {
  email: string
  nim: string
}

const statusAccountStorageKey = 'public-check-status-account'

const getStoredStatusAccount = (): StoredStatusAccount | null => {
  try {
    const stored = window.localStorage.getItem(statusAccountStorageKey)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

const stageStepMap: Record<EffectiveStage, number> = {
  submitted: 1,
  verification: 2,
  document_review: 3,
  discussion: 4,
  announcement: 5,
}

const getStageMessage = (stage: EffectiveStage, status: FinalStatus, type: ProgramType) => {
  if (stage === 'submitted') return 'Berkas berhasil dikirim.'
  if (stage === 'verification') return 'Berkas permohonan Anda telah masuk ke tahap verifikasi awal. Tim kami akan mengecek kelengkapan data pendaftaran Anda.'
  if (stage === 'document_review') return 'Berkas pendukung Anda sedang ditinjau oleh tim kami. Harap pantau halaman ini secara berkala.'
  if (stage === 'discussion') return 'Forum diskusi telah dibuka. Silakan gunakan fitur ini untuk berdiskusi dengan admin terkait pendaftaran Anda.'
  if (status === 'approved') return `Selamat, permohonan ${type} Anda diterima. Silakan unduh surat izin yang perlu dibawa ke Kementerian Hukum.`
  return `Mohon maaf, permohonan ${type} Anda belum dapat kami terima.`
}

const getStatusLabel = (stage: EffectiveStage, status: FinalStatus) => {
  if (stage === 'submitted') return 'Berkas Dikirim'
  if (stage === 'verification') return 'Sedang Diproses'
  if (stage === 'document_review') return 'Review Berkas'
  if (stage === 'discussion') return 'Forum Diskusi'
  return status === 'approved' ? 'Diterima' : 'Ditolak'
}

const parseApplicantAccount = (member?: string, fallbackEmail = '', fallbackNim = ''): ApplicantAccount => {
  const [name = 'Ketua Pendaftar', nim = fallbackNim, email = fallbackEmail] = member?.split('|') ?? []

  return {
    name: name.trim() || 'Ketua Pendaftar',
    nim: nim.trim() || fallbackNim,
    email: email.trim() || fallbackEmail,
  }
}

const CheckStatusPage = () => {
  const location = useLocation()
  const routeState = location.state as { fromSuccess?: boolean; email?: string; nim?: string } | null
  const storedAccount = getStoredStatusAccount()
  const isSuccessRedirect = Boolean(routeState?.fromSuccess)
  const [emailValue, setEmailValue] = useState(routeState?.email ?? storedAccount?.email ?? '')
  const [nimValue, setNimValue] = useState(routeState?.nim ?? storedAccount?.nim ?? '')
  const [isSearching, setIsSearching] = useState(false)
  const [hasResult, setHasResult] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [statusMessage, setStatusMessage] = useState('')
  const [applicantAccount, setApplicantAccount] = useState<ApplicantAccount | null>(null)
  const [submissionId, setSubmissionId] = useState<number | null>(null)
  const [effectiveStage, setEffectiveStage] = useState<EffectiveStage>('submitted')
  const [finalStatus, setFinalStatus] = useState<FinalStatus>('pending')
  const [permitFileName, setPermitFileName] = useState<string | null>(null)
  const [discussionStartedAt, setDiscussionStartedAt] = useState<string | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState<DiscussionMessage[]>([])
  const [chatMessage, setChatMessage] = useState('')
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [downloadingPermit, setDownloadingPermit] = useState(false)
  const messageListRef = useRef<HTMLDivElement>(null)
  const statusLabel = getStatusLabel(effectiveStage, finalStatus)
  const statusColorClass = finalStatus === 'rejected' && effectiveStage === 'announcement'
    ? 'text-red-500'
    : 'text-primary'
  const stepGap = 72
  const progressHeight = hasResult ? (currentStep - 1) * stepGap : 0
  const discussionIsAvailable = effectiveStage === 'discussion' || Boolean(discussionStartedAt)

  const runStatusSearch = async ({ silent = false } = {}) => {
    if (!emailValue.trim() || !nimValue.trim()) {
      if (!silent) toast.error('Email dan NIM wajib diisi')
      return
    }

    setIsSearching(true)
    setHasResult(false)
    setApplicantAccount(null)
    setDiscussionStartedAt(null)
    setChatOpen(false)
    setMessages([])
    
    try {
      const response = await api.get('/check-status', {
        params: { email: emailValue, nim: nimValue }
      })
      
      const data = response.data?.data
      const status = (data?.status ?? 'pending') as FinalStatus
      const stage = (data?.effective_stage ?? 'verification') as EffectiveStage
      const type = (data?.type ?? 'magang') as ProgramType
      setApplicantAccount(parseApplicantAccount(data?.member_1, emailValue, nimValue))
      setSubmissionId(data?.id ?? null)
      setFinalStatus(status)
      setEffectiveStage(stage)
      setCurrentStep(stageStepMap[stage] ?? 2)
      setStatusMessage(getStageMessage(stage, status, type))
      setPermitFileName(data?.permit_file_name ?? null)
      setDiscussionStartedAt(data?.discussion_started_at ?? null)
      setHasResult(true)
      window.localStorage.setItem(statusAccountStorageKey, JSON.stringify({
        email: emailValue,
        nim: nimValue,
      }))
    } catch (error: any) {
      if (!silent) {
        toast.error(error.response?.data?.message || 'Pendaftaran tidak ditemukan atau terjadi kesalahan server.')
      }
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    if (!emailValue || !nimValue) return

    runStatusSearch({ silent: true })
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    await runStatusSearch()
  }

  const loadMessages = async (silent = false) => {
    if (!submissionId) return

    try {
      if (!silent) setLoadingMessages(true)
      const res = await api.get(`/submissions/${submissionId}/messages`, {
        params: { email: emailValue, nim: nimValue },
      })
      setMessages(res.data?.data ?? [])
    } catch (error: any) {
      if (!silent) {
        toast.error(error.response?.data?.message || 'Gagal memuat pesan diskusi')
      }
    } finally {
      if (!silent) setLoadingMessages(false)
    }
  }

  useEffect(() => {
    if (!chatOpen || !submissionId) return

    const timer = window.setInterval(() => {
      loadMessages(true)
    }, 3000)

    return () => window.clearInterval(timer)
  }, [chatOpen, submissionId, emailValue, nimValue])

  useEffect(() => {
    if (!chatOpen) return
    const list = messageListRef.current
    if (!list) return

    list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' })
  }, [chatOpen, messages])

  const handleOpenDiscussion = async () => {
    setChatOpen(true)
    await loadMessages()
  }

  const handleSendMessage = async () => {
    if (!submissionId) return
    const message = chatMessage.trim()
    if (!message) return

    try {
      setSendingMessage(true)
      const res = await api.post(`/submissions/${submissionId}/messages`, {
        email: emailValue,
        nim: nimValue,
        message,
      })
      setMessages(prev => [...prev, res.data?.data])
      setChatMessage('')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengirim pesan')
    } finally {
      setSendingMessage(false)
    }
  }

  const handleDownloadPermit = async () => {
    if (!submissionId) return

    try {
      setDownloadingPermit(true)
      const res = await api.get(`/submissions/${submissionId}/permit/download`, {
        params: { email: emailValue, nim: nimValue },
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', permitFileName || 'surat-izin')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengunduh surat izin')
    } finally {
      setDownloadingPermit(false)
    }
  }

  return (
    <HeroLayout
      image={checkStatusImage}
      title="Cek Status Pendaftaran"
      subtitle="Pantau sejauh mana proses permohonan magang atau penelitian Anda berjalan."
      badge="Track Application"
    >
      <main className="bg-neutral-card min-h-[50vh]">
        <div className={`mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8 ${isSuccessRedirect ? 'status-page-enter' : ''}`}>
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-1.5 text-xs text-neutral-muted" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight size={13} />
            <span className="font-semibold text-primary">Check Status</span>
          </nav>

          {/* Status Timeline */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="overflow-hidden rounded-[24px] border border-secondary bg-white shadow-[0_18px_45px_rgba(110,71,59,0.12)]">
              {hasResult ? (
                <div className="border-b border-secondary bg-gradient-to-br from-neutral-card via-white to-secondary-light px-6 py-6 sm:px-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.14em] text-primary/70">Hasil Pencarian</p>
                      <h3 className="text-xl font-extrabold text-neutral-text">
                        Status Permohonan:{' '}
                        <span className={statusColorClass}>{statusLabel}</span>
                      </h3>
                      <div className="mt-2 space-y-0.5 text-sm leading-relaxed text-neutral-subtle">
                        <p>Ditemukan data pendaftaran atas nama: <strong className="text-primary">{applicantAccount?.name}</strong></p>
                        <p>dengan email {applicantAccount?.email} dan NIM {applicantAccount?.nim}.</p>
                      </div>
                    </div>
                    <span className="inline-flex w-fit shrink-0 whitespace-nowrap rounded-full border border-primary/15 bg-white px-4 py-1.5 text-xs font-bold text-primary shadow-sm">
                      {statusLabel}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="border-b border-secondary bg-gradient-to-br from-neutral-card via-white to-secondary-light px-6 py-6 sm:px-8">
                  <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.14em] text-primary/70">Panduan Status</p>
                  <h3 className="text-lg font-bold text-neutral-text">Alur Status Pendaftaran</h3>
                  <p className="mt-1 text-sm text-neutral-subtle">
                    Masukkan email dan NIM ketua kelompok, lalu tekan <strong>Cari Status</strong> untuk melihat posisi pendaftaran Anda.
                  </p>
                </div>
              )}

              <div className="relative px-6 py-7 sm:px-8">
                <div className="absolute bottom-7 left-[2.75rem] top-12 w-0.5 -translate-x-1/2 bg-secondary sm:left-[3.25rem]" />
                {hasResult && (
                  <div
                    className="status-line-progress absolute left-[2.75rem] top-12 w-0.5 -translate-x-1/2 bg-primary sm:left-[3.25rem]"
                    style={{ height: progressHeight }}
                  />
                )}

                <div className="flex flex-col gap-8">
                  {steps.map((step) => {
                    const isActive = hasResult && step.id === currentStep
                    const isCompleted = hasResult && step.id < currentStep
                    const Icon = step.icon

                    return (
                      <div
                        key={step.id}
                        style={hasResult ? { animationDelay: `${step.id * 110}ms` } : undefined}
                        className={`relative z-10 flex gap-4 rounded-2xl transition-all duration-300 sm:gap-6 ${
                          hasResult ? 'status-step-animate' : ''
                        }`}
                      >
                        <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                          isActive ? 'border-primary bg-primary text-white shadow-lg shadow-primary/25 ring-4 ring-primary/10 scale-105' :
                          isCompleted ? 'border-primary bg-primary text-white shadow-md shadow-primary/20' :
                          'border-neutral-border bg-white text-neutral-muted'
                        }`}>
                          <Icon size={18} strokeWidth={isCompleted || isActive ? 2.5 : 2} />
                          {isCompleted && (
                            <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full border-2 border-white bg-primary text-white shadow-sm">
                              <Check size={10} strokeWidth={3} />
                            </span>
                          )}
                        </div>

                        <div className="pt-1">
                          <h4 className={`text-sm font-bold sm:text-base ${
                            isActive ? 'text-primary' :
                            isCompleted ? 'text-neutral-text' :
                            hasResult ? 'text-neutral-muted' : 'text-neutral-text'
                          }`}>
                            {step.title}
                          </h4>
                          <p className={`mt-0.5 text-xs sm:text-sm ${
                            isActive ? 'font-medium text-neutral-text' : 'text-neutral-muted'
                          }`}>
                            {step.description}
                          </p>

                          {isActive && (
                            <>
                              <div className="mt-3 rounded-2xl border border-secondary bg-white p-4 text-xs shadow-sm sm:text-sm text-neutral-text">
                                <span className="font-semibold text-primary">Informasi:</span> {statusMessage}
                              </div>

                              {effectiveStage === 'discussion' && (
                                <button
                                  type="button"
                                  onClick={handleOpenDiscussion}
                                  className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-secondary bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-white shadow-md shadow-primary/20">
                                    <MessageCircle size={20} />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-neutral-text">Chat diskusi aktif</p>
                                    <p className="text-xs text-neutral-muted">Tekan bagian ini atau ikon chat di kanan bawah untuk membuka pesan.</p>
                                  </div>
                                  <span className="hidden rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-white sm:inline-flex">
                                    Buka Chat
                                  </span>
                                </button>
                              )}

                              {effectiveStage === 'announcement' && finalStatus === 'approved' && permitFileName && (
                                <button
                                  type="button"
                                  onClick={handleDownloadPermit}
                                  disabled={downloadingPermit}
                                  className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-dark disabled:opacity-60"
                                >
                                  <Download size={16} />
                                  {downloadingPermit ? 'Mengunduh...' : 'Unduh Surat Izin'}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {!hasResult && (
            <div className="mt-8 rounded-2xl border border-neutral-border bg-white p-6 shadow-card sm:p-8">
              {isSuccessRedirect && (
                <div className="mb-5 rounded-2xl border border-secondary bg-secondary-light px-4 py-3 text-sm font-semibold text-primary">
                  Pendaftaran berhasil dikirim. Gunakan email dan NIM anggota pertama/ketua untuk mengecek status.
                </div>
              )}
              <h2 className="mb-2 text-xl font-bold text-neutral-text">Lacak Permohonan</h2>
              <p className="mb-7 text-sm text-neutral-subtle">
                Masukkan <strong>Email</strong> dan <strong>NIM</strong> Ketua Kelompok untuk melihat status pendaftaran Anda saat ini.
              </p>

              <form onSubmit={handleSearch} className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center">
                <div className="relative flex-1">
                  <input
                    type="email"
                    placeholder="Email Ketua Kelompok"
                    value={emailValue}
                    onChange={(e) => setEmailValue(e.target.value)}
                    className="h-12 w-full rounded-xl border border-neutral-border bg-neutral-soft px-4 text-sm font-semibold text-neutral-text transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15"
                    required
                  />
                </div>
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="NIM Ketua Kelompok"
                    value={nimValue}
                    onChange={(e) => setNimValue(e.target.value)}
                    className="h-12 w-full rounded-xl border border-neutral-border bg-neutral-soft px-4 text-sm font-semibold text-neutral-text transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                >
                  {isSearching ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    'Cari Status'
                  )}
                </button>
              </form>
            </div>
          )}

        </div>
      </main>

      {hasResult && discussionIsAvailable && !chatOpen && (
        <button
          type="button"
          aria-label="Buka chat diskusi"
          onClick={handleOpenDiscussion}
          className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-[0_18px_35px_rgba(110,71,59,0.28)] transition hover:-translate-y-0.5 hover:bg-primary-dark sm:bottom-7 sm:right-7"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {chatOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/15 backdrop-blur-[1px]" />
          <section className="absolute bottom-4 right-4 flex h-[min(560px,calc(100vh-2rem))] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-2xl border border-neutral-border bg-white shadow-2xl sm:bottom-6 sm:right-6">
            <div className="flex items-center justify-between border-b border-neutral-border bg-primary px-4 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-white/15">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <p className="text-sm font-extrabold">Diskusi Admin</p>
                  <p className="text-xs font-semibold text-white/75">Status pendaftaran</p>
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
                    className={`flex ${message.sender_type === 'applicant' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      message.sender_type === 'applicant'
                        ? 'rounded-br-md bg-primary text-white'
                        : 'rounded-bl-md bg-white text-neutral-text'
                    }`}
                    >
                      <p className={`mb-1 text-xs font-extrabold ${
                        message.sender_type === 'applicant' ? 'text-white/80' : 'text-primary'
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
                  placeholder="Tulis pesan..."
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

      <Footer />
    </HeroLayout>
  )
}

export default CheckStatusPage
