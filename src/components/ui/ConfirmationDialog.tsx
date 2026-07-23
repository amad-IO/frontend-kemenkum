import { useEffect, useRef, type ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, LogOut, Trash2, X } from 'lucide-react'

export type ConfirmVariant = 'danger' | 'warning' | 'default' | 'logout'

export interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: ConfirmVariant
}

interface ConfirmationDialogProps extends ConfirmOptions {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

const variantConfig: Record<
  ConfirmVariant,
  {
    icon: ReactNode
    iconClass: string
    accentClass: string
    confirmBtnClass: string
    defaultConfirmText: string
  }
> = {
  danger: {
    icon: <Trash2 size={25} strokeWidth={2} />,
    iconClass: 'bg-red-50 text-red-600 ring-red-100',
    accentClass: 'bg-red-500',
    confirmBtnClass: 'bg-red-600 text-white shadow-red-600/20 hover:bg-red-700 focus-visible:ring-red-200',
    defaultConfirmText: 'Ya, Hapus',
  },
  warning: {
    icon: <AlertTriangle size={25} strokeWidth={2} />,
    iconClass: 'bg-amber-50 text-amber-600 ring-amber-100',
    accentClass: 'bg-amber-500',
    confirmBtnClass: 'bg-amber-500 text-white shadow-amber-500/20 hover:bg-amber-600 focus-visible:ring-amber-200',
    defaultConfirmText: 'Ya, Lanjutkan',
  },
  logout: {
    icon: <LogOut size={25} strokeWidth={2} />,
    iconClass: 'text-red-500',
    accentClass: 'bg-red-500',
    confirmBtnClass: 'bg-red-500 text-white shadow-red-500/20 hover:bg-red-600 focus-visible:ring-red-200',
    defaultConfirmText: 'Ya, Keluar',
  },
  default: {
    icon: <CheckCircle2 size={25} strokeWidth={2} />,
    iconClass: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    accentClass: 'bg-emerald-500',
    confirmBtnClass: 'bg-primary text-white shadow-primary/20 hover:bg-primary-dark focus-visible:ring-primary/20',
    defaultConfirmText: 'Ya, Konfirmasi',
  },
}

const ConfirmationDialog = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText = 'Batal',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) => {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)
  const config = variantConfig[variant]

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const timer = window.setTimeout(() => cancelRef.current?.focus(), 60)

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel()
        return
      }

      if (event.key === 'Tab') {
        const nodes = [cancelRef.current, confirmRef.current].filter(Boolean) as HTMLElement[]
        const first = nodes[0]
        const last = nodes[nodes.length - 1]

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('keydown', handleKey)
      window.clearTimeout(timer)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-desc"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
    >
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default bg-neutral-900/45 backdrop-blur-[2px] animate-backdrop-in"
        onClick={onCancel}
        aria-label="Tutup dialog"
        tabIndex={-1}
      />

      <div className="relative w-full max-w-[420px] overflow-hidden rounded-[32px] bg-[#fcfaf7] shadow-[0_24px_70px_-18px_rgba(33,29,27,0.38)] animate-dialog-in">
        <button
          type="button"
          onClick={onCancel}
          aria-label="Tutup"
          className="absolute right-5 top-5 z-10 grid h-10 w-10 place-items-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        <div className="flex flex-col items-center px-8 pb-6 pt-12 text-center sm:px-10 sm:pb-8 sm:pt-14">
          <div className={`mb-6 grid h-20 w-20 place-items-center rounded-full ${config.iconClass}`}>
            <div className="scale-125">
              {config.icon}
            </div>
          </div>

          <h2 id="confirm-title" className="text-2xl font-extrabold tracking-tight text-neutral-800">
            {title}
          </h2>
          <p id="confirm-desc" className="mt-3 text-[15px] font-medium leading-relaxed text-neutral-500">
            {message}
          </p>
        </div>

        <div className="flex w-full flex-col-reverse justify-center gap-3 px-8 pb-10 sm:flex-row sm:gap-4 sm:px-10">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="min-h-12 w-full sm:w-auto min-w-[120px] rounded-full border border-neutral-300 bg-transparent px-6 text-[15px] font-bold text-neutral-700 transition hover:bg-neutral-50 hover:border-neutral-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10"
          >
            {cancelText}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className={`min-h-12 w-full sm:w-auto min-w-[120px] rounded-full px-6 text-[15px] font-bold shadow-md transition hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 ${config.confirmBtnClass}`}
          >
            {confirmText ?? config.defaultConfirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationDialog
