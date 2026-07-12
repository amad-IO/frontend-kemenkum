import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '../../services/api'
import { AdminChatContext } from '../../contexts/AdminChatContext'
import type { Submission } from '../../pages/admin/ListPendaftar'
import DetailPendaftarModal from './DetailPendaftarModal'
import Sidebar from './Sidebar'

type FloatingChatSession = {
  submission: Submission
  requestKey: number
}

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chatSessions, setChatSessions] = useState<FloatingChatSession[]>([])
  const [isStartingDiscussion, setIsStartingDiscussion] = useState(false)
  const [readReceipt, setReadReceipt] = useState<{ id: number; key: number } | null>(null)

  const openAdminChat = (submission: Submission) => {
    setChatSessions(prev => {
      const existing = prev.find(session => session.submission.id === submission.id)
      if (existing) {
        return prev.map(session => (
          session.submission.id === submission.id
            ? { submission, requestKey: session.requestKey + 1 }
            : session
        ))
      }

      return [...prev, { submission, requestKey: 1 }]
    })
  }

  const handleStartDiscussion = async (id: number) => {
    try {
      setIsStartingDiscussion(true)
      const res = await api.post(`/admin/submissions/${id}/discussion/start`)
      const updated = res.data?.data as Submission
      setChatSessions(prev => prev.map(session => (
        session.submission.id === id ? { ...session, submission: { ...session.submission, ...updated } } : session
      )))
      toast.success('Forum diskusi berhasil dibuka')
      return true
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal membuka forum diskusi')
      return false
    } finally {
      setIsStartingDiscussion(false)
    }
  }

  const handleMessagesRead = (id: number) => {
    setReadReceipt(prev => ({ id, key: (prev?.key ?? 0) + 1 }))
    setChatSessions(prev => prev.map(session => (
      session.submission.id === id
        ? { ...session, submission: { ...session.submission, unread_admin_messages_count: 0 } }
        : session
    )))
  }

  const handleCloseChat = (id: number) => {
    setChatSessions(prev => prev.filter(session => session.submission.id !== id))
  }

  useEffect(() => {
    if (chatSessions.length === 0) return

    const refreshChatCounts = async () => {
      try {
        const res = await api.get('/admin/submissions')
        const responseData = res.data?.data
        const data: Submission[] = Array.isArray(responseData)
          ? responseData
          : (responseData?.data ?? [])
        const latestById = new Map(data.map(submission => [submission.id, submission]))

        setChatSessions(prev => prev.map(session => {
          const latest = latestById.get(session.submission.id)
          return latest
            ? { ...session, submission: { ...session.submission, ...latest } }
            : session
        }))
      } catch {
        // Silent refresh: jangan ganggu admin saat sedang bekerja.
      }
    }

    const timer = window.setInterval(refreshChatCounts, 10000)
    return () => window.clearInterval(timer)
  }, [chatSessions.length])

  return (
    <AdminChatContext.Provider value={{ openAdminChat, readReceipt }}>
      <div className="flex h-screen overflow-hidden bg-neutral-bg font-sans">

        {/* ── Sidebar ── */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* ── Main content ── */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Topbar mobile */}
          <header className="flex items-center gap-4 border-b border-neutral-border bg-neutral-card px-4 py-3 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-1.5 text-neutral-subtle hover:bg-neutral-bg"
            >
              <Menu size={20} />
            </button>
            <span className="text-sm font-bold text-neutral-text">Admin Panel</span>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>

        {chatSessions.map((session, index) => (
          <DetailPendaftarModal
            key={session.submission.id}
            submission={session.submission}
            onClose={() => handleCloseChat(session.submission.id)}
            onStatusChange={() => undefined}
            onDatesChange={() => undefined}
            onDownload={() => undefined}
            onUploadPermit={async () => false}
            onStartDiscussion={handleStartDiscussion}
            chatOpenRequestKey={session.requestKey}
            chatOnly
            chatStackIndex={index}
            onMessagesRead={handleMessagesRead}
            isUpdating={false}
            isDownloading={false}
            isUploadingPermit={false}
            isStartingDiscussion={isStartingDiscussion}
          />
        ))}
      </div>
    </AdminChatContext.Provider>
  )
}

export default AdminLayout
