import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardCheck, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import Footer from '../../components/public/layout/Footer'
import HeroLayout from '../../components/public/layout/HeroLayout'
import PersyaratanBox from '../../components/public/forms/PersyaratanBox'
import {
  getPersyaratanMagang,
  getPersyaratanPenelitian,
} from '../../services/daftarService'
import daftarHeroImage from '../../assets/03.webp'

type TabType = 'magang' | 'penelitian'

const programTabs: {
  id: TabType
  label: string
}[] = [
  {
    id: 'magang',
    label: 'Magang',
  },
  {
    id: 'penelitian',
    label: 'Penelitian',
  },
]

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
}

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
        <motion.div 
          className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
        >

          {/* ── Breadcrumb ── */}
          <motion.nav variants={itemVariants} className="mb-6 flex items-center gap-1.5 text-xs text-neutral-muted" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight size={13} />
            <span className="font-semibold text-primary">Registration</span>
          </motion.nav>

          {/* ── Tab Toggle ── */}
          <motion.div variants={itemVariants} className="relative mb-8 grid grid-cols-2 rounded-full border border-neutral-border bg-neutral-card p-1.5 shadow-card">
            {programTabs.map(({ id: tab, label }) => (
              <motion.button
                key={tab}
                id={`tab-${tab}`}
                onClick={() => handleTabChange(tab)}
                whileTap={{ scale: 0.96 }}
                className={`relative min-w-0 rounded-full px-4 py-3 text-center text-sm font-extrabold transition-colors duration-200 ${
                  activeTab === tab ? 'text-white' : 'text-neutral-subtle hover:text-primary'
                }`}
              >
                {activeTab === tab && (
                  <motion.span
                    layoutId="program-tab-active"
                    className="absolute inset-0 rounded-full bg-primary shadow-soft"
                    transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                  />
                )}
                <span className="relative z-10 block truncate">{label}</span>
              </motion.button>
            ))}
          </motion.div>

          {/* ── Judul Persyaratan ── */}
          <motion.h2 variants={itemVariants} className="mb-4 text-xl font-bold text-neutral-text capitalize">
            Persyaratan {activeTab}
          </motion.h2>

          {/* ── Kotak Persyaratan ── */}
          <motion.div variants={itemVariants}>
            <PersyaratanBox kategoriList={persyaratan} jenis={activeTab} />
          </motion.div>

          {/* ── Checklist Persetujuan ── */}
          <motion.label
            variants={itemVariants}
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
          </motion.label>

          {/* ── CTA ke Form ── */}
          <motion.div variants={itemVariants} className="mt-5">
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
          </motion.div>

        </motion.div>
      </main>

      <Footer />
    </HeroLayout>
  )
}

export default DaftarPage
