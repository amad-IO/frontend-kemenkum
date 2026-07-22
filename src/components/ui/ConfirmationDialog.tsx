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
    iconClass: 'bg-primary/10 text-primary ring-primary/10',
    accentClass: 'bg-primary',
    confirmBtnClass: 'bg-primary text-white shadow-primary/20 hover:bg-primary-dark focus-visible:ring-primary/20',
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

      <div className="relative w-full max-w-[430px] overflow-hidden rounded-2xl border border-white/70 bg-white text-left shadow-[0_24px_70px_-18px_rgba(33,29,27,0.38)] animate-dialog-in">
        <div className={`absolute inset-x-0 top-0 h-1 ${config.accentClass}`} />

        <button
          type="button"
          onClick={onCancel}
          aria-label="Tutup"
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full text-neutral-muted transition hover:bg-neutral-soft hover:text-neutral-text focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10"
        >
          <X size={19} />
        </button>

        <div className="px-6 pb-5 pt-7 sm:px-7 sm:pt-8">
          <div className={`mb-5 grid h-14 w-14 place-items-center rounded-2xl ring-1 ${config.iconClass}`}>
            {config.icon}
          </div>

          <h2 id="confirm-title" className="pr-10 text-xl font-extrabold tracking-tight text-neutral-text sm:text-[22px]">
            {title}
          </h2>
          <p id="confirm-desc" className="mt-2.5 text-sm font-medium leading-6 text-neutral-subtle">
            {message}
          </p>
        </div>

        <div className="flex flex-col-reverse gap-2.5 border-t border-neutral-border/70 bg-neutral-soft/70 px-6 py-4 sm:flex-row sm:justify-end sm:px-7">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="min-h-11 rounded-xl border border-neutral-border bg-white px-5 text-sm font-bold text-neutral-text shadow-sm transition hover:border-neutral-muted hover:bg-neutral-bg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 sm:min-w-[105px]"
          >
            {cancelText}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className={`min-h-11 rounded-xl px-5 text-sm font-bold shadow-lg transition hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 sm:min-w-[135px] ${config.confirmBtnClass}`}
          >
            {confirmText ?? config.defaultConfirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationDialog
