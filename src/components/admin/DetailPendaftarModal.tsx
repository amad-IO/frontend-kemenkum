import { useState, useEffect, useRef } from 'react'
import { X, MapPin, Briefcase, GraduationCap, Calendar, Phone, Mail, FileText, CheckCircle2, XCircle, Download, BookOpenText, Edit2, Upload, MessageCircle, Send, Minus } from 'lucide-react'
import { toast } from 'react-toastify'
import type { Submission } from '../../pages/admin/ListPendaftar'
import DateRangePickerField from '../public/forms/DateRangePickerField'
import api from '../../services/api'
import {
    publishSubmissionChatSyncEvent,
    subscribeSubmissionChatSyncEvents,
    type SubmissionChatMessage,
} from '../../shared/submissionChatSync'

type DiscussionMessage = SubmissionChatMessage & {
    status?: 'sending' | 'failed'
}

const SEEN_MESSAGE_STORAGE_KEY = 'admin_chat_seen_applicant_message_ids'

const readSeenMessageIds = () => {
    try {
        return JSON.parse(localStorage.getItem(SEEN_MESSAGE_STORAGE_KEY) || '{}') as Record<string, number>
    } catch {
        return {}
    }
}

const writeSeenMessageId = (submissionId: number, messageId: number) => {
    const seen = readSeenMessageIds()
    seen[String(submissionId)] = Math.max(Number(seen[String(submissionId)] ?? 0), messageId)
    localStorage.setItem(SEEN_MESSAGE_STORAGE_KEY, JSON.stringify(seen))
}

const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

interface Props {
    submission: Submission | null
    onClose: () => void
    onStatusChange: (id: number, status: 'approved' | 'rejected') => void
    onDatesChange: (id: number, start_date: string, end_date: string) => void
    onDownload: (id: number, e: React.MouseEvent) => void
    onUploadPermit: (id: number, file: File, replace?: boolean) => Promise<boolean>
    onStartDiscussion: (id: number) => Promise<boolean>
    chatOpenRequestKey?: number
    chatOnly?: boolean
    chatStackIndex?: number
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
    chatOnly = false,
    chatStackIndex = 0,
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
    const [chatPosition, setChatPosition] = useState<{ x: number; y: number } | null>(null)
    const [isDraggingChat, setIsDraggingChat] = useState(false)
    const [chatMinimized, setChatMinimized] = useState(false)
    const [clientUnreadCount, setClientUnreadCount] = useState(0)
    const [latestApplicantMessageId, setLatestApplicantMessageId] = useState(0)
    const permitInputRef = useRef<HTMLInputElement>(null)
    const messageListRef = useRef<HTMLDivElement>(null)
    const chatPanelRef = useRef<HTMLElement>(null)
    const chatDragOffsetRef = useRef({ x: 0, y: 0 })
    const chatDragMovedRef = useRef(false)
    const chatSuppressClickRef = useRef(false)
    const lastMessageIdRef = useRef<number>(0)      // untuk delta polling ?since=id
    const isSendingRef = useRef<boolean>(false)      // hard lock cegah double-send
    const messagesLoadedRef = useRef<boolean>(false) // track apakah sudah initial load

    useEffect(() => {
        if (!submission) return

        setEditStart(submission.start_date.split('T')[0])
        setEditEnd(submission.end_date.split('T')[0])
    }, [submission?.id, submission?.start_date, submission?.end_date])

    useEffect(() => {
        setChatOpen(false)
        setMessages([])
        setChatMessage('')
        setChatPosition(null)
        setIsDraggingChat(false)
        setChatMinimized(false)
        setClientUnreadCount(0)
        setLatestApplicantMessageId(0)
        // Reset refs saat submission berubah
        lastMessageIdRef.current = 0
        isSendingRef.current = false
        messagesLoadedRef.current = false
    }, [submission?.id])

    useEffect(() => {
        if (!submission?.id) return

        return subscribeSubmissionChatSyncEvents((event) => {
            if (event.submissionId !== submission.id) return

            if (event.kind === 'status-updated') {
                if (event.status === 'approved' || event.status === 'rejected') {
                    setChatOpen(false)
                }
                return
            }

            if (event.kind === 'discussion-started') {
                return
            }

            const incomingMessage = event.message
            setMessages((prev) => {
                if (prev.some((message) => message.id === incomingMessage.id)) {
                    return prev
                }

                return [...prev.filter((message) => message.id > 0), incomingMessage]
            })

            if (incomingMessage.id > lastMessageIdRef.current) {
                lastMessageIdRef.current = incomingMessage.id
            }

            if (incomingMessage.sender_type === 'applicant') {
                setLatestApplicantMessageId(incomingMessage.id)
                if (!chatOpen || chatMinimized) {
                    setClientUnreadCount((count) => count + 1)
                } else {
                    setClientUnreadCount(0)
                    onMessagesRead?.(submission.id)
                }
            }
        })
    }, [submission?.id, chatOpen, chatMinimized, onMessagesRead])

    useEffect(() => {
        if (!isDraggingChat || !chatOnly) return

        const handleMouseMove = (event: MouseEvent) => {
            const panel = chatPanelRef.current
            if (!panel) return

            const rect = panel.getBoundingClientRect()
            const margin = 12
            const maxX = window.innerWidth - rect.width - margin
            const maxY = window.innerHeight - rect.height - margin
            const nextX = Math.min(Math.max(event.clientX - chatDragOffsetRef.current.x, margin), Math.max(maxX, margin))
            const nextY = Math.min(Math.max(event.clientY - chatDragOffsetRef.current.y, margin), Math.max(maxY, margin))

            chatDragMovedRef.current = true
            setChatPosition({ x: nextX, y: nextY })
        }

        const handleMouseUp = () => {
            chatSuppressClickRef.current = chatDragMovedRef.current
            setIsDraggingChat(false)
            document.body.style.userSelect = ''
        }

        document.body.style.userSelect = 'none'
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)

        return () => {
            document.body.style.userSelect = ''
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDraggingChat, chatOnly])

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
    const latestMessageFallbackCount = submission?.latest_message?.sender_type === 'applicant'
        && Number(submission.latest_message.id) > Number(readSeenMessageIds()[String(submission.id)] ?? 0)
        ? 1
        : 0
    const unreadCount = Math.max(
        Number(submission?.unread_admin_messages_count ?? 0),
        clientUnreadCount,
        latestMessageFallbackCount
    )
    const hasUnread = unreadCount > 0
    const panelStackOffset = chatStackIndex * 18
    const bubbleStackOffset = chatStackIndex * 72
    const defaultPanelStyle = chatOnly && !chatPosition
        ? {
            right: 24 + panelStackOffset,
            bottom: 24 + panelStackOffset,
        }
        : undefined
    const defaultBubbleStyle = chatOnly && !chatPosition
        ? {
            right: 24 + bubbleStackOffset,
            bottom: 24,
        }
        : undefined

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })

    // ── Initial load semua pesan (hanya sekali saat chat pertama dibuka) ──────
    const loadMessages = async (markRead = true) => {
        if (!submission) return
        if (messagesLoadedRef.current) return  // skip jika sudah loaded

        try {
            setLoadingMessages(true)
            const res = await api.get(`/admin/submissions/${submission.id}/messages`, {
                params: { mark_read: markRead ? 1 : 0 },
            })
            const allMessages = (res.data?.data ?? []) as DiscussionMessage[]
            const applicantMessages = allMessages.filter(m => m.sender_type === 'applicant')
            const latestId = applicantMessages.reduce((max, m) => Math.max(max, Number(m.id)), 0)

            setMessages(allMessages)
            messagesLoadedRef.current = true
            if (allMessages.length > 0) lastMessageIdRef.current = allMessages[allMessages.length - 1].id
            setLatestApplicantMessageId(latestId)

            if (markRead) {
                if (latestId > 0) writeSeenMessageId(submission.id, latestId)
                setClientUnreadCount(0)
                onMessagesRead?.(submission.id)
            } else {
                const seenId = Number(readSeenMessageIds()[String(submission.id)] ?? 0)
                setClientUnreadCount(applicantMessages.filter(m => Number(m.id) > seenId).length)
            }
        } catch {
            toast.error('Gagal memuat pesan diskusi')
        } finally {
            setLoadingMessages(false)
        }
    }

    // ── Delta polling: hanya ambil pesan baru sejak lastMessageIdRef ───────────
    const pollNewMessages = async (markRead = true) => {
        if (!submission || !messagesLoadedRef.current) return

        try {
            const params: Record<string, unknown> = { mark_read: markRead ? 1 : 0 }
            if (lastMessageIdRef.current > 0) params.since = lastMessageIdRef.current

            const res = await api.get(`/admin/submissions/${submission.id}/messages`, { params })
            const newMsgs = (res.data?.data ?? []) as DiscussionMessage[]

            if (newMsgs.length > 0) {
                setMessages(prev => {
                    // Dedup: hanya tambah pesan yang belum ada (cegah duplikasi)
                    const existingIds = new Set(prev.filter(m => m.id > 0).map(m => m.id))
                    const withoutOptimistic = prev.filter(m => m.id > 0) // hapus optimistik (id < 0)
                    const trulyNew = newMsgs.filter(m => !existingIds.has(m.id))
                    return trulyNew.length > 0 ? [...withoutOptimistic, ...trulyNew] : prev
                })
                lastMessageIdRef.current = newMsgs[newMsgs.length - 1].id

                // Update unread tracking dari pesan baru
                const newApplicant = newMsgs.filter(m => m.sender_type === 'applicant')
                if (newApplicant.length > 0) {
                    const latestId = newApplicant[newApplicant.length - 1].id
                    setLatestApplicantMessageId(latestId)
                    if (markRead) {
                        writeSeenMessageId(submission.id, latestId)
                        setClientUnreadCount(0)
                        onMessagesRead?.(submission.id)
                    } else {
                        setClientUnreadCount(prev => prev + newApplicant.length)
                    }
                }
            }
        } catch {
            // Silent — jangan ganggu UX saat polling gagal
        }
    }

    // ── Ref stabil agar interval tidak restart saat messages berubah ───────────
    const pollRef = useRef(pollNewMessages)
    useEffect(() => { pollRef.current = pollNewMessages })

    // ── Polling saat chat terbuka (aktif) — setiap 2 detik ───────────────────
    useEffect(() => {
        if (!chatOpen || !submission || (chatOnly && chatMinimized)) return

        loadMessages()  // initial load (di-skip jika sudah loaded)
        const immediate = window.setTimeout(() => pollRef.current(true), 600)
        const interval = window.setInterval(() => pollRef.current(true), 2000)
        const handleVisibility = () => { if (!document.hidden) pollRef.current(true) }
        document.addEventListener('visibilitychange', handleVisibility)

        return () => {
            window.clearTimeout(immediate)
            window.clearInterval(interval)
            document.removeEventListener('visibilitychange', handleVisibility)
        }
    }, [chatOpen, submission?.id, chatOnly, chatMinimized])

    // ── Polling saat minimize — setiap 8 detik, tidak mark read ─────────────
    useEffect(() => {
        if (!chatOpen || !submission || !chatOnly || !chatMinimized) return

        const interval = window.setInterval(() => pollRef.current(false), 8000)
        return () => window.clearInterval(interval)
    }, [chatOpen, submission?.id, chatOnly, chatMinimized])

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
        if (!submission) return false

        if (submission.discussion_started_at) {
            setChatOpen(true)
            setChatMinimized(false)
            return true
        }

        const ok = await onStartDiscussion(submission.id)
        if (ok) {
            setChatOpen(true)
            setChatMinimized(false)
            publishSubmissionChatSyncEvent({
                kind: 'discussion-started',
                submissionId: submission.id,
                discussionStartedAt: new Date().toISOString(),
            })
        }
        return ok
    }

    useEffect(() => {
        if (!chatOpenRequestKey || !submission) return

        const openRequestedChat = async () => {
            const opened = await handleOpenChat()
            if (chatOnly && !opened) onClose()
        }

        void openRequestedChat()
    }, [chatOpenRequestKey, submission?.id, chatOnly])

    const handleSendMessage = async () => {
        if (!submission) return
        const message = chatMessage.trim()
        if (!message) return

        // Hard lock: cegah double-send dari Enter + onClick bersamaan
        if (isSendingRef.current) return
        isSendingRef.current = true

        const tempId = -Date.now()
        const optimisticMessage: DiscussionMessage = {
            id: tempId,
            sender_type: 'admin',
            sender_name: 'Admin Kementerian Hukum',
            message,
            created_at: new Date().toISOString(),
            status: 'sending',
        }

        setMessages(prev => [...prev, optimisticMessage])
        setChatMessage('')

        try {
            setSendingMessage(true)
            const res = await api.post(`/admin/submissions/${submission.id}/messages`, { message })
            const serverMsg = res.data?.data as DiscussionMessage
            // Ganti optimistic dengan data server, atau buang jika polling sudah ambil
            setMessages(prev => {
                const hasTemp = prev.some(m => m.id === tempId)
                const alreadyAdded = prev.some(m => m.id === serverMsg?.id)
                if (hasTemp) return prev.map(m => m.id === tempId ? serverMsg : m)
                if (!alreadyAdded && serverMsg?.id) return [...prev.filter(m => m.id !== tempId), serverMsg]
                return prev.filter(m => m.id !== tempId)
            })
            if (serverMsg?.id) lastMessageIdRef.current = Math.max(lastMessageIdRef.current, serverMsg.id)
            publishSubmissionChatSyncEvent({
                kind: 'message-sent',
                submissionId: submission.id,
                message: serverMsg,
            })
        } catch (error: any) {
            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m))
            toast.error(error.response?.data?.message || 'Gagal mengirim pesan')
        } finally {
            setSendingMessage(false)
            isSendingRef.current = false
        }
    }

    const handleChatDragStart = (event: React.MouseEvent<HTMLElement>) => {
        if (!chatOnly || event.button !== 0) return

        const panel = chatPanelRef.current
        if (!panel) return

        const rect = panel.getBoundingClientRect()
        chatDragOffsetRef.current = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        }
        chatDragMovedRef.current = false
        chatSuppressClickRef.current = false
        setChatPosition({ x: rect.left, y: rect.top })
        setIsDraggingChat(true)
        event.preventDefault()
    }

    const handleMinimizeChat = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation()
        const panel = chatPanelRef.current
        if (panel) {
            const rect = panel.getBoundingClientRect()
            const bubbleSize = 56
            const margin = 12
            const maxX = window.innerWidth - bubbleSize - margin
            const maxY = window.innerHeight - bubbleSize - margin
            const x = chatPosition
                ? rect.right - bubbleSize
                : window.innerWidth - bubbleSize - 24 - bubbleStackOffset
            const y = chatPosition
                ? rect.bottom - bubbleSize
                : window.innerHeight - bubbleSize - 24
            setChatPosition({
                x: Math.min(Math.max(x, margin), Math.max(maxX, margin)),
                y: Math.min(Math.max(y, margin), Math.max(maxY, margin)),
            })
        }
        setChatMinimized(true)
    }

    const handleRestoreChat = () => {
        if (chatSuppressClickRef.current) {
            chatSuppressClickRef.current = false
            return
        }

        if (chatPosition) {
            const margin = 12
            const panelWidth = Math.min(448, window.innerWidth - (margin * 2))
            const panelHeight = Math.min(560, window.innerHeight - (margin * 2))
            const maxX = window.innerWidth - panelWidth - margin
            const maxY = window.innerHeight - panelHeight - margin
            setChatPosition({
                x: Math.min(Math.max(chatPosition.x, margin), Math.max(maxX, margin)),
                y: Math.min(Math.max(chatPosition.y, margin), Math.max(maxY, margin)),
            })
        }

        const latestSeenId = latestApplicantMessageId
            || (submission?.latest_message?.sender_type === 'applicant' ? Number(submission.latest_message.id) : 0)

        if (submission && latestSeenId > 0) {
            writeSeenMessageId(submission.id, latestSeenId)
            setClientUnreadCount(0)
        }

        setChatMinimized(false)
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
        <div
            className={
                chatOnly
                    ? 'pointer-events-none fixed inset-0 z-50'
                    : 'fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6'
            }
        >
            {!chatOnly && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={chatOpen ? undefined : onClose} />
            )}

            {!chatOnly && (
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
                                            className={`flex min-h-10 items-center justify-center gap-1.5 rounded-xl border px-2 text-[11px] font-bold shadow-sm transition ${chatCanStart
                                                    ? 'border-primary/20 bg-white text-primary hover:bg-primary hover:text-white'
                                                    : 'border-neutral-border bg-neutral-bg text-neutral-muted hover:border-primary/30 hover:text-primary'
                                                }`}
                                        >
                                            <MessageCircle size={14} />
                                            Chat
                                            <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${chatIsActive
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
            )}

            {chatOnly && !chatOpen && (
                <div className="pointer-events-auto fixed bottom-4 right-4 rounded-2xl border border-neutral-border bg-white px-5 py-4 text-sm font-bold text-neutral-text shadow-2xl sm:bottom-6 sm:right-6">
                    Membuka forum diskusi...
                </div>
            )}

            {chatOpen && (
                <div className={chatOnly ? 'pointer-events-none fixed inset-0 z-[60]' : 'fixed inset-0 z-[60]'}>
                    {!chatOnly && <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />}
                    {chatOnly && chatMinimized ? (
                        <button
                            ref={(node) => {
                                chatPanelRef.current = node
                            }}
                            type="button"
                            aria-label="Buka kembali chat"
                            onMouseDown={handleChatDragStart}
                            onClick={handleRestoreChat}
                            title={`${ketua?.nama || 'Pendaftar'} - ${submission.letter_number}`}
                            style={chatPosition ? { left: chatPosition.x, top: chatPosition.y } : defaultBubbleStyle}
                            className={`pointer-events-auto grid h-14 w-14 place-items-center rounded-full bg-primary text-white shadow-2xl ring-4 ring-primary/10 transition hover:bg-primary-dark ${chatPosition || defaultBubbleStyle ? 'absolute' : 'absolute bottom-4 right-4 sm:bottom-6 sm:right-6'
                                } ${isDraggingChat ? 'cursor-grabbing' : 'cursor-grab'}`}
                        >
                            <MessageCircle size={24} />
                            {hasUnread && (
                                <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-amber-400 px-1.5 text-xs font-extrabold leading-none text-primary shadow-md shadow-primary/25">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </button>
                    ) : (
                        <section
                            ref={chatPanelRef}
                            style={chatOnly && chatPosition ? { left: chatPosition.x, top: chatPosition.y } : defaultPanelStyle}
                            className={`pointer-events-auto flex h-[min(560px,calc(100vh-2rem))] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-2xl border border-neutral-border bg-white shadow-2xl ${chatOnly && (chatPosition || defaultPanelStyle) ? 'absolute' : 'absolute bottom-4 right-4 sm:bottom-6 sm:right-6'
                                }`}
                        >
                            <div
                                onMouseDown={handleChatDragStart}
                                className={`flex items-center justify-between border-b border-neutral-border bg-primary px-4 py-4 text-white ${chatOnly ? 'cursor-grab active:cursor-grabbing' : ''
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="grid h-10 w-10 place-items-center rounded-full bg-white/15">
                                        <MessageCircle size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-extrabold">Forum Diskusi</p>
                                        <p className="text-xs font-semibold text-white/75">{ketua?.nama || 'Pendaftar'}</p>
                                        <p className="mt-0.5 max-w-[220px] truncate text-[11px] font-bold text-white/85">
                                            {submission.letter_number}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {chatOnly && (
                                        <button
                                            type="button"
                                            aria-label="Minimize chat"
                                            onMouseDown={(event) => event.stopPropagation()}
                                            onClick={handleMinimizeChat}
                                            className="grid h-9 w-9 place-items-center rounded-full text-white transition hover:bg-white/15"
                                        >
                                            <Minus size={20} />
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        aria-label="Tutup chat"
                                        onMouseDown={(event) => event.stopPropagation()}
                                        onClick={() => {
                                            setChatOpen(false)
                                            if (chatOnly) onClose()
                                        }}
                                        className="grid h-9 w-9 place-items-center rounded-full text-white transition hover:bg-white/15"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
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
                                            <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm shadow-sm ${message.sender_type === 'admin'
                                                    ? 'rounded-br-md bg-primary text-white'
                                                    : 'rounded-bl-md bg-white text-neutral-text'
                                                }`}
                                            >
                                                <p className={`mb-1 text-xs font-extrabold ${message.sender_type === 'admin' ? 'text-white/80' : 'text-primary'
                                                    }`}>
                                                    {message.sender_name}
                                                </p>
                                                <p className="leading-relaxed">{message.message}</p>
                                                {message.status ? (
                                                    <p className={`mt-1 text-[10px] font-bold ${message.status === 'failed'
                                                            ? message.sender_type === 'admin' ? 'text-red-100' : 'text-red-500'
                                                            : message.sender_type === 'admin' ? 'text-white/65' : 'text-neutral-muted'
                                                        }`}>
                                                        {message.status === 'failed' ? '✕ Gagal terkirim' : '⏳ Mengirim...'}
                                                    </p>
                                                ) : (
                                                    <p className={`mt-1 text-[10px] ${message.sender_type === 'admin' ? 'text-right text-white/50' : 'text-neutral-muted'
                                                        }`}>
                                                        {formatTime(message.created_at)}
                                                    </p>
                                                )}
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
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault()
                                                handleSendMessage()
                                            }
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
                    )}
                </div>
            )}
        </div>
    )
}

export default DetailPendaftarModal
