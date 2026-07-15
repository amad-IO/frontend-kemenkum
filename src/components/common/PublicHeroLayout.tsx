import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import PublicLogo from './PublicLogo'
import PublicNavbar from './PublicNavbar'
import homeHeroImage from '../../assets/o1.webp'
import daftarHeroImage from '../../assets/03.webp'

type PublicHeroLayoutProps = {
  children: ReactNode
}

const homeTitle = [
  '— Mulai langkah awal',
  'untuk meniti dan mengembangkan',
  'karir profesional Anda di bidang hukum',
]

const PublicHeroLayout = ({ children }: PublicHeroLayoutProps) => {
  const location = useLocation()
  const isRegistration = location.pathname.startsWith('/daftar')

  const heroImage = isRegistration ? daftarHeroImage : homeHeroImage
  const titleLines = isRegistration ? ['Pendaftaran Program'] : homeTitle

  return (
    <div className="min-h-screen bg-[#211D1B]">
      <section
        className="min-h-screen bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,rgba(0,0,0,0.34)_0%,rgba(0,0,0,0.18)_42%,rgba(33,29,27,0.62)_100%),linear-gradient(90deg,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.34)_44%,rgba(0,0,0,0.04)_100%)] px-7 pb-32 pt-8 sm:px-12 sm:pt-10 lg:px-[clamp(56px,7vw,104px)] lg:pt-12">
          <PublicLogo className="h-auto w-36 sm:w-44 lg:w-[206px]" />

          <div className={`text-left text-neutral-card ${isRegistration ? 'mt-[18vh] max-w-none pl-[clamp(20px,12vw,330px)]' : 'mt-[clamp(82px,17vh,150px)] max-w-[760px] pl-[clamp(24px,10vw,120px)]'}`}>
            <div className={isRegistration ? 'max-w-3xl' : 'max-w-none'}>
              {isRegistration && (
                <span className="inline-flex items-center rounded-full bg-neutral-card/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-neutral-card ring-1 ring-neutral-card/35 backdrop-blur">
                  Requirement & Registration
                </span>
              )}

              <h1 className={`${isRegistration ? 'mt-4 text-3xl sm:text-5xl lg:text-6xl' : 'text-[clamp(1rem,3.8vw,2.35rem)]'} font-bold italic leading-[1.08] tracking-normal text-neutral-card drop-shadow-[0_2px_4px_rgba(0,0,0,0.24)]`}>
                {titleLines.map((line) => (
                  <span key={line} className="block whitespace-nowrap">
                    {line}
                  </span>
                ))}
              </h1>

              {isRegistration && (
                <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-card/90 sm:text-base">
                  Pilih jenis program, baca persyaratan, lalu isi form pendaftaran.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="-mt-20 bg-neutral-card rounded-t-[40px] sm:-mt-20 sm:rounded-t-[56px] lg:-mt-20 lg:rounded-t-[72px]">
        <div className="sticky top-0 z-50 bg-neutral-card rounded-t-[40px] sm:rounded-t-[56px] lg:rounded-t-[72px]">
          <header className="mx-auto w-full max-w-[1330px] px-6 lg:px-12">
            <PublicNavbar />
          </header>
        </div>

        <div className="flow-root flex-1 bg-neutral-card">
          {children}
        </div>
      </div>
    </div>
  )
}

export default PublicHeroLayout
