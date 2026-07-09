import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ChevronRight, ClipboardEdit, FileSearch, CheckSquare, MessageCircle, Megaphone } from 'lucide-react'
import Footer from '../../components/public/layout/Footer'
import HeroLayout from '../../components/public/layout/HeroLayout'
import checkStatusImage from '../../assets/03.webp'

const steps = [
  { id: 1, title: 'Pendaftaran', description: 'Berkas berhasil dikirim', icon: ClipboardEdit },
  { id: 2, title: 'Review Berkas', description: 'Admin sedang mengecek kelengkapan dokumen', icon: FileSearch },
  { id: 3, title: 'Verifikasi', description: 'Persetujuan pimpinan Kemenkumham', icon: CheckSquare },
  { id: 4, title: 'Forum Diskusi', description: 'Tanya jawab dan Wawancara', icon: MessageCircle },
  { id: 5, title: 'Pengumuman', description: 'Hasil akhir & Dokumen Izin Magang', icon: Megaphone },
]

const CheckStatusPage = () => {
  const [searchValue, setSearchValue] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [hasResult, setHasResult] = useState(false)

  // Dummy current step (misalnya tertahan di langkah 2: Review Berkas)
  const currentStep = 2

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchValue.trim()) return

    setIsSearching(true)
    setHasResult(false)
    
    // Simulate API call
    setTimeout(() => {
      setIsSearching(false)
      setHasResult(true)
    }, 1000)
  }

  return (
    <HeroLayout
      image={checkStatusImage}
      title="Cek Status Pendaftaran"
      subtitle="Pantau sejauh mana proses permohonan magang atau penelitian Anda berjalan."
      badge="Track Application"
    >
      <main className="bg-neutral-card min-h-[50vh]">
        <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-1.5 text-xs text-neutral-muted" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight size={13} />
            <span className="font-semibold text-primary">Check Status</span>
          </nav>

          {/* Search Card */}
          <div className="rounded-2xl border border-neutral-border bg-white p-6 shadow-card sm:p-8">
            <h2 className="mb-2 text-xl font-bold text-neutral-text">Lacak Permohonan</h2>
            <p className="mb-6 text-sm text-neutral-subtle">
              Masukkan <strong>Email Ketua Kelompok</strong> atau <strong>Nomor Surat Pengantar</strong> untuk melihat status pendaftaran Anda saat ini.
            </p>

            <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-neutral-muted">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Contoh: B-1234/UNIV/2026 atau email@kampus.ac.id"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="h-12 w-full rounded-xl border border-neutral-border bg-neutral-soft pl-11 pr-4 text-sm font-semibold text-neutral-text transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
              >
                {isSearching ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  'Cari Status'
                )}
              </button>
            </form>
          </div>

          {/* Result / Timeline */}
          {hasResult && (
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="rounded-2xl border border-neutral-border bg-white p-6 shadow-card sm:p-8">
                <div className="mb-8 border-b border-neutral-border pb-4">
                  <h3 className="text-lg font-bold text-neutral-text">Status Permohonan: <span className="text-primary">Sedang Diproses</span></h3>
                  <p className="text-sm text-neutral-subtle mt-1">Ditemukan data pendaftaran atas pencarian: <strong>{searchValue}</strong></p>
                </div>

                {/* Vertical Stepper */}
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute bottom-0 left-[1.15rem] top-2 w-0.5 bg-neutral-border" />
                  
                  <div className="flex flex-col gap-8">
                    {steps.map((step) => {
                      const isActive = step.id === currentStep
                      const isCompleted = step.id < currentStep
                      
                      const Icon = step.icon

                      return (
                        <div key={step.id} className="relative z-10 flex gap-4 sm:gap-6">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-300 ${
                            isActive ? 'border-primary bg-primary text-white shadow-lg shadow-primary/30 ring-4 ring-primary/10' :
                            isCompleted ? 'border-primary bg-white text-primary' :
                            'border-neutral-border bg-neutral-soft text-neutral-muted'
                          }`}>
                            <Icon size={18} strokeWidth={isCompleted || isActive ? 2.5 : 2} />
                          </div>
                          
                          <div className="pt-1">
                            <h4 className={`text-sm font-bold sm:text-base ${
                              isActive ? 'text-primary' :
                              isCompleted ? 'text-neutral-text' :
                              'text-neutral-muted'
                            }`}>
                              {step.title}
                            </h4>
                            <p className={`mt-0.5 text-xs sm:text-sm ${
                              isActive ? 'font-medium text-neutral-text' : 'text-neutral-muted'
                            }`}>
                              {step.description}
                            </p>
                            
                            {isActive && (
                              <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs sm:text-sm text-neutral-text">
                                <span className="font-semibold text-primary">Informasi:</span> Berkas permohonan Anda telah kami terima dan saat ini sedang dalam proses pengecekan awal oleh tim kami. Harap memantau halaman ini secara berkala.
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </HeroLayout>
  )
}

export default CheckStatusPage
