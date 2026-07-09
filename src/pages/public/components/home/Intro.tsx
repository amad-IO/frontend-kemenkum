import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import PhotoCard from './PhotoCard'
import introCard from '../../../../assets/02.webp'

const Intro = () => {
  return (
    <section
      className="mx-auto mb-20 mt-10 grid max-w-[1210px] items-center gap-10 px-6 text-center sm:mt-14 lg:mb-32 lg:mt-16 lg:grid-cols-[minmax(240px,420px)_minmax(0,1fr)] lg:gap-[clamp(48px,8vw,132px)] lg:px-0 lg:text-left"
      id="registration"
    >
      <div className="flex justify-center lg:justify-start">
        <PhotoCard
          imageSrc={introCard}
          imageAlt="Mahasiswa berdiskusi dalam program magang"
          caption="Buka potensi Anda dan rasakan pengalaman kerja profesional bersama Kementerian Hukum."
          className="rotate-[8deg] origin-bottom-right drop-shadow-[0_32px_48px_rgba(110,71,59,0.18)]"
        />
      </div>

      <div className="flex flex-col gap-5">
        <span className="inline-flex w-fit mx-auto lg:mx-0 items-center gap-2 rounded-full bg-[#6E473B]/10 px-4 py-1.5 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-primary">
          Program Resmi Kementerian Hukum
        </span>

        <h2 className="mx-auto max-w-[640px] text-[clamp(1.7rem,2.8vw,3.1rem)] font-extrabold leading-[1.08] tracking-[-0.02em] text-[#211D1B] lg:mx-0">
          Eksplorasi ruang belajar{' '}
          <span className="text-primary">profesional,</span>{' '}
          kembangkan inovasi bersama para ahli, dan bangun{' '}
          <span className="italic font-medium text-[#6E473B]/70">
            fondasi karir masa depan
          </span>{' '}
          Anda di sini.
        </h2>

        <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
          {['Kerja Praktik', 'Penelitian Akademik', 'Pengembangan Karir'].map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-[0.82rem] font-semibold tracking-wide text-primary"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-2">
          <Link
            to="/daftar"
            className="group inline-flex items-center justify-center gap-4 rounded-2xl bg-primary px-10 py-4 text-[1.15rem] font-bold tracking-wide text-white shadow-[0_8px_32px_rgba(110,71,59,0.30)] transition-all duration-300 hover:-translate-y-1 hover:bg-primary-dark hover:shadow-[0_12px_40px_rgba(110,71,59,0.40)] sm:text-[1.25rem]"
          >
            <span>Daftar Sekarang</span>
            <ArrowRight
              size={20}
              strokeWidth={2.5}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default Intro
