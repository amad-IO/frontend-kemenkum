import { useRouteError } from 'react-router-dom'
import { RefreshCw, AlertTriangle, Home } from 'lucide-react'

const RouteErrorBoundary = () => {
  const error = useRouteError() as Error

  // Khusus untuk error Vite Dynamic Import (ChunkLoadError)
  // Ini sering terjadi saat server restart tapi browser belum refresh
  const isChunkError = error?.message?.includes('Failed to fetch dynamically imported module') ||
                       error?.message?.includes('Importing a module script failed')

  // Jika ini error chunk loading, coba reload halaman secara otomatis 1 kali
  if (isChunkError) {
    const hasReloaded = sessionStorage.getItem('chunk_reload_attempted')
    if (!hasReloaded) {
      sessionStorage.setItem('chunk_reload_attempted', 'true')
      window.location.reload()
      return null // Jangan render apa-apa selagi reload
    }
  }

  // Jika sudah mencoba reload tapi tetap error, atau ini error tipe lain
  sessionStorage.removeItem('chunk_reload_attempted')

  const handleReset = () => {
    window.location.href = '/'
  }

  const handleReload = () => {
    window.location.reload()
  }

  const showDetails = import.meta.env.DEV

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-bg px-4 py-16 font-sans">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-50 shadow-lg shadow-red-100">
        <AlertTriangle size={44} className="text-red-400" strokeWidth={1.5} />
      </div>

      <h1 className="mb-2 text-center text-2xl font-extrabold text-neutral-text">
        {isChunkError ? 'Versi Baru Tersedia' : 'Oops! Terjadi Kesalahan'}
      </h1>
      <p className="mb-8 max-w-sm text-center text-sm leading-relaxed text-neutral-muted">
        {isChunkError 
          ? 'Aplikasi telah diperbarui. Silakan muat ulang halaman untuk mendapatkan versi terbaru.'
          : 'Aplikasi mengalami masalah saat memuat halaman ini. Silakan muat ulang atau kembali ke beranda.'}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={handleReload}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-primary-dark"
        >
          <RefreshCw size={16} />
          Muat Ulang Halaman
        </button>
        <button
          onClick={handleReset}
          className="flex items-center justify-center gap-2 rounded-xl border border-neutral-border bg-white px-6 py-3 text-sm font-bold text-neutral-text shadow-sm transition hover:bg-neutral-bg"
        >
          <Home size={16} />
          Kembali ke Beranda
        </button>
      </div>

      {showDetails && error && (
        <details className="mt-10 w-full max-w-2xl rounded-2xl border border-red-100 bg-red-50 p-5 text-left">
          <summary className="cursor-pointer text-xs font-bold uppercase tracking-wider text-red-500">
            Detail Error (Development Only)
          </summary>
          <div className="mt-4 space-y-3">
            <div>
              <p className="mb-1 text-xs font-bold text-red-600">Message:</p>
              <pre className="overflow-x-auto rounded-lg bg-red-100 p-3 text-xs text-red-800 whitespace-pre-wrap">
                {error.message || JSON.stringify(error)}
              </pre>
            </div>
            {error.stack && (
              <div>
                <p className="mb-1 text-xs font-bold text-red-600">Stack Trace:</p>
                <pre className="overflow-x-auto rounded-lg bg-red-100 p-3 text-xs text-red-800">
                  {error.stack}
                </pre>
              </div>
            )}
          </div>
        </details>
      )}
    </div>
  )
}

export default RouteErrorBoundary
