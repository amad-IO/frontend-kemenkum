import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import ConfirmationDialog, { type ConfirmOptions } from '../components/ui/ConfirmationDialog'

// ── Types ─────────────────────────────────────────────────────────────────────

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean
}

const defaultState: ConfirmState = {
  isOpen: false,
  title: '',
  message: '',
}

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<ConfirmState>(defaultState)

  // resolveRef holds the resolve function of the current pending Promise.
  // Using a ref avoids stale closure issues in the callbacks.
  const resolveRef = useRef<((value: boolean) => void) | null>(null)

  const confirm: ConfirmFn = useCallback((options) => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve
      setState({ ...options, isOpen: true })
    })
  }, [])

  const handleConfirm = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }))
    resolveRef.current?.(true)
    resolveRef.current = null
  }, [])

  const handleCancel = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }))
    resolveRef.current?.(false)
    resolveRef.current = null
  }, [])

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmationDialog
        isOpen={state.isOpen}
        title={state.title}
        message={state.message}
        confirmText={state.confirmText}
        cancelText={state.cancelText}
        variant={state.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * useConfirm — returns an async `confirm(options)` function.
 *
 * Usage:
 *   const confirm = useConfirm()
 *   const ok = await confirm({ title: '…', message: '…', variant: 'danger' })
 *   if (ok) { // user clicked confirm }
 */
export const useConfirm = (): ConfirmFn => {
  const ctx = useContext(ConfirmContext)
  if (!ctx) {
    throw new Error('useConfirm must be used inside <ConfirmProvider>')
  }
  return ctx
}
