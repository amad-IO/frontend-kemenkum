import { useEffect, useState } from 'react'
import { Eye, MessageCircle } from 'lucide-react'
import type { Submission } from '../../pages/admin/ListPendaftar'
import api from '../../services/api'

interface SubmissionTableProps {
  data: Submission[]
  onOpenDetail: (submission: Submission) => void
  onOpenChat: (submission: Submission) => void
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
const getUnreadCount = (submission: Submission) => Number(submission.unread_admin_messages_count ?? 0)
const SEEN_MESSAGE_STORAGE_KEY = 'admin_chat_seen_applicant_message_ids'

type MessagePreview = {
  id: number
  sender_type: 'admin' | 'applicant'
}

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

const getLatestMessageFallbackCount = (submission: Submission) => {
  const latestMessage = submission.latest_message
  if (!latestMessage || latestMessage.sender_type !== 'applicant') return 0

  const seenId = Number(readSeenMessageIds()[String(submission.id)] ?? 0)
  return Number(latestMessage.id) > seenId ? 1 : 0
}

const SubmissionTable = ({ data, onOpenDetail, onOpenChat }: SubmissionTableProps) => {
  const [clientUnreadCounts, setClientUnreadCounts] = useState<Record<number, number>>({})
  const [latestApplicantMessageIds, setLatestApplicantMessageIds] = useState<Record<number, number>>({})

  useEffect(() => {
    if (!Array.isArray(data) || data.length === 0) {
      setClientUnreadCounts({})
      setLatestApplicantMessageIds({})
      return
    }

    let cancelled = false

    const loadClientUnreadCounts = async () => {
      const seenMessageIds = readSeenMessageIds()
      const entries = await Promise.all(
        data.map(async (submission) => {
          try {
            const res = await api.get(`/admin/submissions/${submission.id}/messages`, {
              params: { mark_read: 0 },
            })
            const messages = (res.data?.data ?? []) as MessagePreview[]
            const applicantMessages = messages.filter(message => message.sender_type === 'applicant')
            const latestId = applicantMessages.reduce((max, message) => Math.max(max, Number(message.id)), 0)
            const seenId = Number(seenMessageIds[String(submission.id)] ?? 0)
            const count = applicantMessages.filter(message => Number(message.id) > seenId).length

            return [submission.id, { count, latestId }] as const
          } catch {
            return [submission.id, { count: 0, latestId: 0 }] as const
          }
        })
      )

      if (cancelled) return

      setClientUnreadCounts(Object.fromEntries(entries.map(([id, value]) => [id, value.count])))
      setLatestApplicantMessageIds(Object.fromEntries(entries.map(([id, value]) => [id, value.latestId])))
    }

    loadClientUnreadCounts()
    const timer = window.setInterval(loadClientUnreadCounts, 10000)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [data])

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm table-fixed min-w-[940px]">
        <thead>
          <tr className="border-b border-neutral-border bg-neutral-bg text-xs text-neutral-muted">
            <th className="px-5 py-3 text-left font-semibold w-[22%]">Peserta</th>
            <th className="px-5 py-3 text-left font-semibold w-[26%]">Program & Instansi</th>
            <th className="px-5 py-3 text-left font-semibold w-[16%]">Tanggal Kegiatan</th>
            <th className="px-5 py-3 text-left font-semibold w-[12%]">Status</th>
            <th className="px-5 py-3 text-center font-semibold w-[10%]">Chat</th>
            <th className="px-5 py-3 text-right font-semibold w-[10%]">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(data) && data.length > 0 ? (
            data.map((s, i) => {
              const unreadCount = Math.max(
                getUnreadCount(s),
                clientUnreadCounts[s.id] ?? 0,
                getLatestMessageFallbackCount(s)
              )
              const chatIsReady = Boolean(s.discussion_started_at || s.document_downloaded_at)
              const hasUnread = unreadCount > 0

              return (
                <tr
                  key={s.id}
                  className={`transition-colors ${
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

                  <td className="px-5 py-3 text-center">
                    <button
                      type="button"
                      title={hasUnread ? `${unreadCount} pesan belum dibaca` : 'Buka chat diskusi'}
                      onClick={(e) => {
                        e.stopPropagation()
                        const latestMessageId = latestApplicantMessageIds[s.id]
                          ?? (s.latest_message?.sender_type === 'applicant' ? Number(s.latest_message.id) : 0)
                        if (latestMessageId > 0) {
                          writeSeenMessageId(s.id, latestMessageId)
                          setClientUnreadCounts(prev => ({ ...prev, [s.id]: 0 }))
                        }
                        onOpenChat(s)
                      }}
                      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
                        hasUnread
                          ? 'border-primary bg-white text-primary shadow-md shadow-primary/20 hover:bg-primary hover:text-white'
                          : chatIsReady
                            ? 'border-primary/20 bg-white text-primary hover:bg-primary hover:text-white'
                            : 'border-neutral-border bg-neutral-bg text-neutral-muted hover:border-primary/30 hover:text-primary'
                      }`}
                    >
                      <MessageCircle size={16} />
                      {hasUnread && (
                        <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-amber-400 px-1 text-[11px] font-extrabold leading-none text-primary shadow-sm shadow-primary/25">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </button>
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
              )
            })
          ) : (
            <tr>
              <td colSpan={6} className="py-10 text-center text-sm text-neutral-muted">
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
