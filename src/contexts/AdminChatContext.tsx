import { createContext, useContext } from 'react'
import type { Submission } from '../pages/admin/ListPendaftar'

type ReadReceipt = {
  id: number
  key: number
} | null

type AdminChatContextValue = {
  openAdminChat: (submission: Submission) => void
  readReceipt: ReadReceipt
}

export const AdminChatContext = createContext<AdminChatContextValue | null>(null)

export const useAdminChat = () => {
  const context = useContext(AdminChatContext)
  if (!context) {
    throw new Error('useAdminChat must be used inside AdminChatContext.Provider')
  }

  return context
}
