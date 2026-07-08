import { useNavigate } from 'react-router-dom'
import PublicFooter from '../../components/common/PublicFooter'
import PublicNavbar from '../../components/common/PublicNavbar'
import FormPenelitianSection from '../../components/public/daftar/FormPenelitianSection'
import PersyaratanBox from '../../components/public/daftar/PersyaratanBox'
import { getPersyaratanPenelitian } from '../../services/daftarService'

const FormPenelitian = () => {
  const navigate = useNavigate()

  return (
    <>
      {/* 1. KONTEN UTAMA (Dibatasi lebar max-w & memiliki padding horizontal) */}
      <div className="min-h-screen bg-neutral-bg px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <PublicNavbar />
        </div>
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-12 pt-6 sm:gap-8 sm:pt-8">
          <section className="rounded-xl border border-neutral-border bg-white p-5 shadow-card sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Pendaftaran Program
            </p>
            <h1 className="mt-2 text-2xl font-bold text-neutral-text sm:text-3xl">
              Form Pendaftaran Penelitian
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-muted sm:text-base">
              Lengkapi data penelitian dan unggah dokumen persyaratan dalam format ZIP.
            </p>
          </section>

          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <section className="min-w-0">
              <FormPenelitianSection onSuccess={() => navigate('/daftar')} />
            </section>
            <aside className="min-w-0 xl:sticky xl:top-6">
              <PersyaratanBox kategoriList={getPersyaratanPenelitian()} jenis="penelitian" />
            </aside>
          </div>
        </main>
      </div>

      {/* 2. FOOTER (Di luar kontainer, otomatis membentang full lebar) */}
      <PublicFooter />
    </>
  )
}

export default FormPenelitian