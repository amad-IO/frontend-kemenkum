import { Component, type ErrorInfo, type ReactNode } from 'react'
import { RefreshCw, AlertTriangle, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  /** Tampilkan detail error — aktif otomatis di mode development */
  showDetails?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Global Error Boundary — mencegah blank white page saat ada runtime error.
 *
 * Cara kerja:
 * - Jika salah satu komponen di dalamnya throw error saat render,
 *   React akan memanggil getDerivedStateFromError & componentDidCatch.
 * - Komponen ini kemudian menampilkan halaman fallback yang ramah
 *   daripada membiarkan layar kosong/putih.
 *
 * Catatan: Error Boundary HARUS berupa class component (React limitation).
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })
    // Di production bisa dikirim ke Sentry / logging service di sini
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary] Uncaught error:', error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.href = '/'
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    const { hasError, error, errorInfo } = this.state
    const { children, showDetails = import.meta.env.DEV } = this.props

    if (!hasError) return children

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-bg px-4 py-16">
        {/* Icon */}
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-50 shadow-lg shadow-red-100">
          <AlertTriangle size={44} className="text-red-400" strokeWidth={1.5} />
        </div>

        {/* Heading */}
        <h1 className="mb-2 text-center text-2xl font-extrabold text-neutral-text">
          Oops! Terjadi Kesalahan
        </h1>
        <p className="mb-8 max-w-sm text-center text-sm leading-relaxed text-neutral-muted">
          Aplikasi mengalami masalah tak terduga. Silakan muat ulang halaman
          atau kembali ke halaman utama.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={this.handleReload}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-primary-dark"
          >
            <RefreshCw size={16} />
            Muat Ulang Halaman
          </button>
          <button
            onClick={this.handleReset}
            className="flex items-center justify-center gap-2 rounded-xl border border-neutral-border bg-white px-6 py-3 text-sm font-bold text-neutral-text shadow-sm transition hover:bg-neutral-bg"
          >
            <Home size={16} />
            Kembali ke Beranda
          </button>
        </div>

        {/* Error details — hanya di development */}
        {showDetails && error && (
          <details className="mt-10 w-full max-w-2xl rounded-2xl border border-red-100 bg-red-50 p-5 text-left">
            <summary className="cursor-pointer text-xs font-bold uppercase tracking-wider text-red-500">
              Detail Error (Development Only)
            </summary>
            <div className="mt-4 space-y-3">
              <div>
                <p className="mb-1 text-xs font-bold text-red-600">Message:</p>
                <pre className="overflow-x-auto rounded-lg bg-red-100 p-3 text-xs text-red-800">
                  {error.message}
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
              {errorInfo?.componentStack && (
                <div>
                  <p className="mb-1 text-xs font-bold text-red-600">Component Stack:</p>
                  <pre className="overflow-x-auto rounded-lg bg-red-100 p-3 text-xs text-red-800">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}
      </div>
    )
  }
}

export default ErrorBoundary
