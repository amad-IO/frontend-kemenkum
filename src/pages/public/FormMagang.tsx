import { useNavigate } from 'react-router-dom'
import PublicFooter from '../../components/common/PublicFooter'
import PublicNavbar from '../../components/common/PublicNavbar'
import FormMagangSection from '../../components/public/daftar/FormMagangSection'
import PersyaratanBox from '../../components/public/daftar/PersyaratanBox'
import { getPersyaratanMagang } from '../../services/daftarService'

const FormMagang = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-neutral-bg">
      <PublicNavbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Pendaftaran Program
          </p>
          <h1 className="text-3xl font-bold text-neutral-text sm:text-4xl">
            Form Pendaftaran Magang
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-neutral-muted sm:text-base">
            Lengkapi data pendaftar dan unggah dokumen persyaratan dalam format ZIP.
          </p>
        </section>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-2xl border border-neutral-border bg-white p-5 shadow-card sm:p-7">
            <FormMagangSection onSuccess={() => navigate('/konfirmasi')} />
          </section>
          <aside>
            <PersyaratanBox kategoriList={getPersyaratanMagang()} jenis="magang" />
          </aside>
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}

export default FormMagang
