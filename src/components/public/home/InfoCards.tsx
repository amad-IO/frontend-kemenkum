import infoCardImage from '../../../assets/o1.webp'

const InfoCards = () => {
  return (
    <section className="mx-auto grid max-w-[1330px] gap-5 lg:grid-cols-3" id="guideline">

      {/* Card 1 — Teks ajakan */}
      <article className="group relative aspect-[3/2] overflow-hidden rounded-[20px] border border-white/70 bg-neutral-card px-5 py-6 shadow-[0_10px_28px_rgba(110,71,59,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(110,71,59,0.13)] lg:px-7 lg:py-7">
        <h3 className="relative z-10 mb-2.5 max-w-[300px] text-[clamp(0.95rem,1.1vw,1.15rem)] font-extrabold leading-[1.15] text-neutral-text">
          Bersiaplah Menjadi Penerus Hukum Indonesia
        </h3>
        <div className="mb-3 h-[3px] w-12 rounded-full bg-primary" />
        <p className="relative z-10 max-w-[340px] text-[clamp(0.78rem,0.85vw,0.88rem)] font-semibold leading-[1.5] text-primary">
          Saatnya keluar dari zona nyaman dan rasakan langsung pengalaman kerja
          profesional di Kementerian Hukum. Jangan lewatkan peluang emas ini,
          daftarkan dirimu sekarang dan beri kontribusi nyata untuk bangsa!
        </p>
        <strong
          className="pointer-events-none absolute -bottom-3 -left-1 text-[clamp(2.6rem,3.8vw,3.5rem)] font-extrabold leading-[0.86] text-primary/[0.06]"
          aria-hidden="true"
        >
          Kementrian hukum
        </strong>
      </article>

      {/* Card 2 — Teks undangan */}
      <article className="relative flex aspect-[3/2] overflow-hidden rounded-[20px] border border-white/70 bg-[linear-gradient(145deg,#FAF8F4_0%,#F0E8DE_100%)] px-5 py-6 shadow-[0_10px_28px_rgba(110,71,59,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(110,71,59,0.13)] lg:px-7 lg:py-7">
        <div className="relative z-10 self-center">
          <h3 className="mb-2.5 text-[clamp(0.95rem,1.1vw,1.15rem)] font-extrabold leading-[1.15] text-neutral-text">
            Mulai langkahmu di sini.
          </h3>
          <p className="max-w-[340px] text-[clamp(0.78rem,0.85vw,0.88rem)] font-semibold leading-[1.5] text-primary">
            Kami mengundang generasi muda yang siap belajar dan berkembang untuk
            bergabung dalam program magang Kementerian Hukum. Jadilah bagian
            dari perubahan yang membawa dampak nyata bagi masyarakat.
          </p>
        </div>
      </article>

      {/* Card 3 — Gambar */}
      <article className="group relative aspect-[3/2] overflow-hidden rounded-[20px] bg-primary-light shadow-[0_10px_28px_rgba(110,71,59,0.12)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(110,71,59,0.18)]">
        <img
          className="absolute inset-0 h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
          src={infoCardImage}
          alt="Informasi program magang Kementerian Hukum"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent p-4 text-neutral-card">
          <span className="mb-1 block text-[0.68rem] font-bold uppercase tracking-[0.14em] text-secondary-light">
            Ruang belajar
          </span>
          <p className="max-w-sm text-[0.92rem] font-bold leading-tight">
            Belajar langsung dari lingkungan kerja profesional.
          </p>
        </div>
      </article>

    </section>
  )
}

export default InfoCards
