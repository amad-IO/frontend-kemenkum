import { useEffect, useRef } from 'react'
import { AlertTriangle, LogOut, Trash2, CheckCircle2, Monitor, X } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Variant config ─────────────────────────────────────────────────────────────

const variantConfig: Record<
  ConfirmVariant,
  {
    glowColor: string
    illustration: React.ReactNode
    confirmBtnClass: string
    defaultConfirmText: string
  }
> = {
  danger: {
    glowColor: 'bg-red-400/20',
    illustration: (
      <div className="relative flex h-32 w-32 items-center justify-center">
        {/* Decorative background shapes */}
        <div className="absolute inset-2 rounded-[2rem] bg-red-50 rotate-6 transition-transform group-hover:rotate-12" />
        <div className="absolute inset-2 rounded-[2rem] bg-red-100/50 -rotate-3 transition-transform group-hover:-rotate-6" />
        {/* Main Icon */}
        <Trash2 size={56} className="text-red-500 relative z-10 drop-shadow-sm" strokeWidth={1.2} />
        {/* Badge */}
        <div className="absolute bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-white bg-red-500 text-white shadow-sm z-20">
          <AlertTriangle size={18} strokeWidth={2.5} />
        </div>
      </div>
    ),
    confirmBtnClass: 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 text-white',
    defaultConfirmText: 'Delete',
  },
  warning: {
    glowColor: 'bg-amber-400/20',
    illustration: (
      <div className="relative flex h-32 w-32 items-center justify-center">
        <div className="absolute inset-2 rounded-full bg-amber-50" />
        <div className="absolute inset-4 rounded-full bg-amber-100/60" />
        <Monitor size={56} className="text-neutral-700 relative z-10 drop-shadow-sm" strokeWidth={1.2} />
        <div className="absolute -bottom-1 -right-2 flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-white bg-red-500 text-white shadow-sm z-20">
          <X size={20} strokeWidth={2.5} />
        </div>
      </div>
    ),
    confirmBtnClass: 'bg-black hover:bg-neutral-800 shadow-lg shadow-black/20 text-white',
    defaultConfirmText: 'Yes',
  },
  logout: {
    glowColor: 'bg-primary/10',
    illustration: (
      <div className="relative flex h-32 w-32 items-center justify-center">
        <div className="absolute inset-2 rounded-[2rem] bg-primary/5 -rotate-6" />
        <div className="absolute inset-2 rounded-[2rem] bg-primary/10 rotate-3" />
        <LogOut size={56} className="text-primary relative z-10 drop-shadow-sm ml-3" strokeWidth={1.2} />
      </div>
    ),
    confirmBtnClass: 'bg-primary hover:bg-primary-dark shadow-lg shadow-primary/30 text-white',
    defaultConfirmText: 'Keluar',
  },
  default: {
    glowColor: 'bg-green-400/20',
    illustration: (
      <div className="relative flex h-32 w-32 items-center justify-center">
        <div className="absolute inset-2 rounded-full bg-green-50" />
        <div className="absolute inset-4 rounded-full bg-green-100/60" />
        <Monitor size={56} className="text-neutral-700 relative z-10 drop-shadow-sm" strokeWidth={1.2} />
        <div className="absolute -bottom-1 -right-2 flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-white bg-green-500 text-white shadow-sm z-20">
          <CheckCircle2 size={20} strokeWidth={2.5} />
        </div>
      </div>
    ),
    confirmBtnClass: 'bg-black hover:bg-neutral-800 shadow-lg shadow-black/20 text-white',
    defaultConfirmText: 'Yes',
  },
}

// ── Component ──────────────────────────────────────────────────────────────────

const ConfirmationDialog = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) => {
  const cancelRef  = useRef<HTMLButtonElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)
  const config     = variantConfig[variant]

  // ── Focus trap + ESC ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return

    const timer = setTimeout(() => cancelRef.current?.focus(), 60)

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onCancel(); return }

      if (e.key === 'Tab') {
        const nodes = [cancelRef.current, confirmRef.current].filter(Boolean) as HTMLElement[]
        const first = nodes[0]
        const last  = nodes[nodes.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKey)
    return () => { document.removeEventListener('keydown', handleKey); clearTimeout(timer) }
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
      {/* ── Animated backdrop ── */}
      <div
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-[3px] animate-backdrop-in"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* ── Dialog card ── */}
      <div className="relative w-full max-w-[360px] overflow-hidden rounded-[36px] bg-white shadow-2xl animate-dialog-in text-center p-8">
        
        {/* ── Radial Glow Top ── */}
        <div className={`absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full blur-[40px] opacity-80 pointer-events-none ${config.glowColor}`} />

        {/* ── Header ── */}
        <h2
          id="confirm-title"
          className="relative z-10 text-[22px] font-bold text-neutral-800 tracking-tight mb-8"
        >
          {title}
        </h2>

        {/* ── Illustration Area ── */}
        <div className="relative z-10 flex justify-center mb-8 group">
          {config.illustration}
        </div>

        {/* ── Message ── */}
        <p
          id="confirm-desc"
          className="relative z-10 text-[15px] font-medium text-neutral-600 leading-snug mb-10 px-2"
        >
          {message}
        </p>

        {/* ── Actions ── */}
        <div className="relative z-10 flex items-center justify-center gap-3 sm:gap-4">
          {/* Cancel */}
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="flex-1 rounded-full bg-neutral-400/20 px-4 py-3.5 text-[15px] font-bold text-neutral-600 transition-colors hover:bg-neutral-400/30 focus:outline-none focus:ring-4 focus:ring-neutral-200"
          >
            {cancelText}
          </button>

          {/* Confirm */}
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className={`
              flex-1 rounded-full px-4 py-3.5 text-[15px] font-bold
              transition-all duration-200
              active:scale-95
              focus:outline-none focus:ring-4 focus:ring-black/10
              ${config.confirmBtnClass}
            `}
          >
            {confirmText ?? config.defaultConfirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationDialog
