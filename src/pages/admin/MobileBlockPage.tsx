import { ShieldAlert, Monitor, SmartphoneNfc } from 'lucide-react'

/**
 * Popup blokir yang tampil di tengah layar ketika admin mencoba mengakses
 * panel melalui smartphone. Background di-blur/gelap, popup tidak bisa ditutup.
 */
const MobileBlockPage = () => {
  return (
    <>
      {/* ── Overlay latar belakang — tidak bisa diklik untuk tutup ── */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-5">

        {/* ── Popup Card ── */}
        <div
          className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
          style={{ animation: 'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both' }}
        >

          {/* Strip merah atas */}
          <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-rose-500 to-red-400" />

          {/* Konten */}
          <div className="px-6 pb-6 pt-5">

            {/* Ikon + badge */}
            <div className="mb-4 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 ring-1 ring-red-100">
                <ShieldAlert className="h-6 w-6 text-red-500" />
              </div>
              <div className="pt-0.5">
                <span className="inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-red-600">
                  Akses Ditolak
                </span>
                <h2 className="mt-1 text-base font-bold leading-snug text-gray-900">
                  Perangkat Tidak Didukung
                </h2>
              </div>
            </div>

            {/* Pesan utama */}
            <p className="text-sm leading-relaxed text-gray-600">
              Developer <span className="font-semibold text-gray-800">tidak mengizinkan</span>{' '}
              Dashboard Admin Kementrian Hukum diakses melalui{' '}
              <span className="font-semibold text-red-600">perangkat mobile (smartphone)</span>.
              Demi keamanan data dan pengalaman pengelolaan yang optimal, akses hanya
              tersedia pada perangkat berikut:
            </p>

            {/* Perangkat yang diizinkan */}
            <div className="mt-4">
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                <Monitor className="h-4 w-4 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-emerald-500">Diizinkan</p>
                  <p className="text-xs font-semibold text-emerald-800">Desktop / Laptop</p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="my-4 border-t border-gray-100" />

            {/* Perangkat yang dilarang */}
            <div className="flex items-center gap-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5">
              <SmartphoneNfc className="h-4 w-4 shrink-0 text-red-400" />
              <p className="text-xs text-red-600">
                <span className="font-semibold">Smartphone</span> — tidak diizinkan mengakses panel ini
              </p>
            </div>

            {/* Footer info */}
            <p className="mt-4 text-center text-[11px] text-gray-400">
              Sistem Pendaftaran Magang &amp; Penelitian · Kementrian Hukum RI
            </p>
          </div>
        </div>
      </div>

      {/* Animasi pop-in via style tag */}
      <style>{`
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.85) translateY(16px); }
          100% { opacity: 1; transform: scale(1)    translateY(0);     }
        }
      `}</style>
    </>
  )
}

export default MobileBlockPage
