import { useEffect, useRef } from 'react'

/**
 * useVisibilityPolling
 *
 * Menjalankan polling dengan setInterval, tapi otomatis:
 * - BERHENTI saat tab browser disembunyikan (user buka tab lain / minimize)
 * - LANGSUNG fetch saat tab aktif kembali
 *
 * Menghemat request ke server yang percuma saat tidak ada yang melihat.
 *
 * @param callback   Fungsi yang dipanggil setiap interval
 * @param intervalMs Jarak antar pemanggilan dalam milidetik
 * @param enabled    Jika false, polling tidak berjalan sama sekali
 */
export function useVisibilityPolling(
  callback: () => void,
  intervalMs: number,
  enabled: boolean
) {
  const callbackRef = useRef(callback)

  // Selalu gunakan versi callback terbaru tanpa re-setup interval
  useEffect(() => {
    callbackRef.current = callback
  })

  useEffect(() => {
    if (!enabled) return

    let timerId: number

    const startPolling = () => {
      timerId = window.setInterval(() => callbackRef.current(), intervalMs)
    }

    const stopPolling = () => {
      window.clearInterval(timerId)
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling()
      } else {
        callbackRef.current()
        startPolling()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    startPolling()

    return () => {
      stopPolling()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [intervalMs, enabled])
}
