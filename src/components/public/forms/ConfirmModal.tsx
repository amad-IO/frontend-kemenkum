import { useEffect, useState } from 'react'
import { Loader2, AlertCircle, X, CheckCircle2, UploadCloud, Mail, IdCard } from 'lucide-react'
import amplopBuka from '../../../assets/amplopbuka.svg'
import amplopTutup from '../../../assets/amploptutup.svg'

interface ConfirmModalProps {
  isOpen: boolean
  isSubmitting: boolean
  isSuccess?: boolean
  accountEmail?: string
  accountNim?: string
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
}

const ConfirmModal = ({
  isOpen,
  isSubmitting,
  isSuccess = false,
  accountEmail,
  accountNim,
  onClose,
  onConfirm,
  title = "Konfirmasi Pendaftaran",
  message = "Apakah Anda sudah yakin dengan data yang diisi? Data yang sudah dikirim tidak dapat diubah kembali."
}: ConfirmModalProps) => {
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (isOpen) setIsClosing(false)
  }, [isOpen])

  if (!isOpen) return null

  const isLocked = isSubmitting || isSuccess
  const handleClose = () => {
    if (isSubmitting || isClosing) return

    setIsClosing(true)
    window.setTimeout(onClose, 240)
  }

  return (
    <div className={`modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm ${isClosing ? 'modal-backdrop-exit' : 'modal-backdrop-enter'}`}>
      <div className={`modal-panel w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ${isClosing ? 'modal-panel-exit' : 'modal-panel-enter'}`}>
        <div className="flex items-center justify-between border-b border-neutral-border bg-neutral-bg/50 px-5 py-4">
          <div className={`flex items-center gap-2 ${isSuccess ? 'text-emerald-600' : 'text-primary'}`}>
            {isSuccess ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <h3 className="font-bold text-neutral-text">
              {isSuccess ? 'Pendaftaran Berhasil' : title}
            </h3>
          </div>
          {!isLocked && (
            <button onClick={handleClose} className="rounded-lg p-1 text-neutral-muted hover:bg-neutral-border hover:text-neutral-text transition">
              <X size={18} />
            </button>
          )}
        </div>
        <div className="p-5 text-center text-sm leading-relaxed text-neutral-subtle">
          {isSubmitting && (
            <div className="zip-send-stage mx-auto mb-4">
              <div className="zip-send-target">
                <UploadCloud size={18} />
              </div>
              <span className="zip-send-trail zip-send-trail-one" />
              <span className="zip-send-trail zip-send-trail-two" />
              <span className="zip-send-trail zip-send-trail-three" />
              <div className="zip-send-file">
                <span className="zip-send-file-icon" aria-hidden="true">
                  <span className="zip-send-file-fold" />
                  <span className="zip-send-file-zipper" />
                </span>
                <span>ZIP</span>
              </div>
            </div>
          )}

          {isSuccess && (
            <div className="success-send-hero mx-auto mb-4">
              <div className="success-send-card">
                <img
                  src={amplopTutup}
                  alt=""
                  aria-hidden="true"
                  className="success-envelope-svg success-envelope-svg-closed"
                />
                <img
                  src={amplopBuka}
                  alt=""
                  aria-hidden="true"
                  className="success-envelope-svg success-envelope-svg-open"
                />
              </div>
            </div>
          )}

          <p className={isLocked ? 'font-semibold text-neutral-text' : ''}>
            {isSubmitting
              ? 'Sedang mengirim data pendaftaran...'
              : isSuccess
                ? 'File pendaftaran berhasil dikirim. Gunakan email dan NIM anggota pertama/ketua untuk melihat status pendaftaran atau berdiskusi.'
                : message}
          </p>

          {isSuccess && (accountEmail || accountNim) && (
            <div className="mt-4 grid gap-2 text-left">
              {accountEmail && (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-emerald-600 shadow-sm">
                    <Mail size={17} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">Email Akun</p>
                    <p className="truncate text-sm font-extrabold text-neutral-text">{accountEmail}</p>
                  </div>
                </div>
              )}

              {accountNim && (
                <div className="flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50/80 px-3 py-2">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-amber-600 shadow-sm">
                    <IdCard size={17} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">NIM / NISN Akun</p>
                    <p className="truncate text-sm font-extrabold text-neutral-text">{accountNim}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 bg-neutral-bg/30 px-5 py-4">
          {isSuccess ? (
            <button
              type="button"
              onClick={handleClose}
              className="flex min-w-[110px] items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-primary-dark"
            >
              OK
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleClose}
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
