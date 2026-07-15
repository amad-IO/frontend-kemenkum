import { useMemo } from 'react'

/**
 * Mendeteksi apakah perangkat saat ini adalah smartphone (mobile phone).
 *
 * Logika kombinasi dua sinyal:
 *  1. User-Agent string — cocokkan dengan pola umum smartphone
 *  2. Lebar layar       — layar < 768px diasumsikan smartphone
 *
 * Tablet (iPad, Android tablet) dan desktop TIDAK dianggap mobile.
 *
 * @returns `true` jika perangkat adalah smartphone, `false` jika tablet / desktop.
 */
export function useIsMobileDevice(): boolean {
  return useMemo(() => {
    const ua = navigator.userAgent

    // ── Deteksi via User-Agent ───────────────────────────────────────────────
    // "Android" + "Mobile" → Android phone (bukan Android tablet)
    const uaMobile =
      /Android.+Mobile/i.test(ua) ||
      /iPhone/i.test(ua) ||
      /Windows Phone/i.test(ua) ||
      /BlackBerry|BB10/i.test(ua) ||
      /Opera Mini/i.test(ua) ||
      /IEMobile/i.test(ua)

    // ── Deteksi via lebar layar ──────────────────────────────────────────────
    // Layar < 768px → hampir pasti smartphone (bukan tablet / desktop)
    const screenMobile = window.innerWidth < 768

    // Dianggap mobile jika KEDUA sinyal menunjukkan mobile,
    // ATAU jika UA jelas-jelas mobile (tidak mungkin desktop spoof ke < 768px).
    return uaMobile || screenMobile
  }, [])
}
