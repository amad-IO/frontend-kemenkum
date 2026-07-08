import { Loader2, AlertCircle, X, CheckCircle2 } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  isSubmitting: boolean
  isSuccess?: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
}

const ConfirmModal = ({ 
  isOpen, 
  isSubmitting, 
  isSuccess = false,
  onClose, 
  onConfirm,
  title = "Konfirmasi Pendaftaran",
  message = "Apakah Anda sudah yakin dengan data yang diisi? Data yang sudah dikirim tidak dapat diubah kembali."
}: ConfirmModalProps) => {
  if (!isOpen) return null

  const isLocked = isSubmitting || isSuccess

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-neutral-border bg-neutral-bg/50 px-5 py-4">
          <div className={`flex items-center gap-2 ${isSuccess ? 'text-emerald-600' : 'text-primary'}`}>
            {isSuccess ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <h3 className="font-bold text-neutral-text">
              {isSuccess ? 'Pendaftaran Berhasil' : title}
            </h3>
          </div>
          {!isLocked && (
            <button onClick={onClose} className="rounded-lg p-1 text-neutral-muted hover:bg-neutral-border hover:text-neutral-text transition">
              <X size={18} />
            </button>
          )}
        </div>
        <div className="p-5 text-center text-sm leading-relaxed text-neutral-subtle">
          {isSubmitting && (
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Loader2 size={34} className="animate-spin" />
            </div>
          )}

          {isSuccess && (
            <div className="mx-auto mb-4 flex h-16 w-16 animate-in zoom-in duration-300 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={38} className="animate-in zoom-in duration-500" />
            </div>
          )}

          <p className={isLocked ? 'font-semibold text-neutral-text' : ''}>
            {isSubmitting
              ? 'Sedang mengirim data pendaftaran...'
              : isSuccess
                ? 'Data berhasil dikirim. Anda akan diarahkan kembali ke halaman daftar.'
                : message}
          </p>
        </div>
        <div className={`flex items-center justify-end gap-3 bg-neutral-bg/30 px-5 py-4 ${isSuccess ? 'hidden' : ''}`}>
          <button
            type="button"
            onClick={onClose}
            disabled={isLocked}
            className="rounded-xl border border-neutral-border bg-white px-4 py-2 text-sm font-semibold text-neutral-text transition hover:bg-neutral-bg disabled:opacity-50"
          >
            Cek Kembali
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLocked}
            className="flex min-w-[140px] items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-md transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Mengirim...
              </>
            ) : (
              'Ya, Kirim Sekarang'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
