import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardCheck, ChevronRight } from 'lucide-react'
import Footer from '../../components/public/layout/Footer'
import HeroLayout from '../../components/public/layout/HeroLayout'
import PersyaratanBox from '../../components/public/forms/PersyaratanBox'
import {
  getPersyaratanMagang,
  getPersyaratanPenelitian,
} from '../../services/daftarService'
import daftarHeroImage from '../../assets/03.webp'

type TabType = 'magang' | 'penelitian'

const DaftarPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('magang')
  const [checked, setChecked] = useState(false)

  const persyaratan =
    activeTab === 'magang' ? getPersyaratanMagang() : getPersyaratanPenelitian()

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    setChecked(false) // reset checklist saat ganti tab
  }

  return (
    <HeroLayout
      image={daftarHeroImage}
      title="Pendaftaran Program"
      subtitle="Pilih jenis program, baca persyaratan, lalu isi form pendaftaran."
      badge="Requirement & Registration"
    >
      <main className="bg-neutral-card">
        <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">

          {/* ── Breadcrumb ── */}
          <nav className="mb-6 flex items-center gap-1.5 text-xs text-neutral-muted" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight size={13} />
            <span className="font-semibold text-primary">Registration</span>
          </nav>

          {/* ── Tab Toggle ── */}
          <div className="mb-8 flex rounded-2xl border border-neutral-border bg-neutral-card p-1.5 shadow-card">
            {(['magang', 'penelitian'] as TabType[]).map((tab) => (
              <button
                key={tab}
                id={`tab-${tab}`}
                onClick={() => handleTabChange(tab)}
                className={`flex-1 rounded-xl py-3 text-sm font-bold capitalize transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-primary text-white shadow-card'
                    : 'text-neutral-subtle hover:text-primary'
                }`}
              >
                {tab === 'magang' ? 'Magang' : 'Penelitian'}
              </button>
            ))}
          </div>

          {/* ── Judul Persyaratan ── */}
          <h2 className="mb-4 text-xl font-bold text-neutral-text capitalize">
            Persyaratan {activeTab}
          </h2>

          {/* ── Kotak Persyaratan ── */}
          <PersyaratanBox kategoriList={persyaratan} jenis={activeTab} />

          {/* ── Checklist Persetujuan ── */}
          <label
            htmlFor="checklist-syarat"
            className={`mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition-all duration-200 ${
              checked
                ? 'border-primary bg-primary/5'
                : 'border-neutral-border bg-neutral-card hover:border-primary/40'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              <input
                id="checklist-syarat"
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="h-5 w-5 cursor-pointer accent-primary"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-text">
                Saya sudah menyiapkan semua persyaratan di atas
              </p>
              <p className="mt-0.5 text-xs text-neutral-muted">
                Centang untuk mengaktifkan tombol pendaftaran
              </p>
            </div>
          </label>

          {/* ── CTA ke Form ── */}
          <div className="mt-5">
            {checked ? (
              <Link
                to={activeTab === 'magang' ? '/daftar/magang/1' : '/daftar/penelitian/1'}
                id={`btn-lanjut-${activeTab}`}
                className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-xl"
              >
                <ClipboardCheck size={18} />
                Lanjut ke Form Pendaftaran {activeTab === 'magang' ? 'Magang' : 'Penelitian'}
              </Link>
            ) : (
              <button
                disabled
                className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-neutral-border py-4 text-base font-bold text-neutral-muted"
              >
                <ClipboardCheck size={18} />
                Centang persetujuan untuk melanjutkan
              </button>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </HeroLayout>
  )
}

export default DaftarPage
