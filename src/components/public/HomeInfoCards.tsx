import infoCardImage from '../../assets/o1.webp'

const HomeInfoCards = () => {
  return (
    <section
      className="mx-auto grid max-w-[1330px] gap-6 lg:grid-cols-3"
      id="guideline"
    >
      <article className="relative min-h-[340px] overflow-hidden rounded-[28px] bg-[#f4f4f4] px-7 py-9 lg:min-h-[405px] lg:px-11 lg:py-12">
        <h3 className="mb-5 max-w-[360px] text-[clamp(1.35rem,1.6vw,1.7rem)] font-extrabold leading-[1.12] text-[#080706]">
          Bersiaplah Menjadi Penerus Hukum Indonesia
        </h3>
        <p className="relative z-10 max-w-[410px] text-[clamp(1rem,1.2vw,1.28rem)] font-semibold leading-[1.06] text-primary">
          Saatnya keluar dari zona nyaman dan rasakan langsung pengalaman kerja
          profesional di Kementerian Hukum. Jangan lewatkan peluang emas ini,
          daftarkan dirimu sekarang dan beri kontribusi nyata untuk bangsa!
        </p>
        <strong
          className="pointer-events-none absolute -bottom-7 -left-2 text-[clamp(4rem,6.5vw,6.3rem)] font-extrabold leading-[0.88] text-[#e5e3e3]"
          aria-hidden="true"
        >
          Kementrian hukum
        </strong>
      </article>

      <article className="flex min-h-[340px] items-end overflow-hidden rounded-[28px] bg-[#f4f4f4] px-7 py-16 lg:min-h-[405px] lg:px-11 lg:pb-24">
        <div>
          <h3 className="mb-4 text-[clamp(1.35rem,1.6vw,1.7rem)] font-extrabold leading-[1.12] text-[#080706]">
            Mulai langkahmu di sini.
          </h3>
          <p className="max-w-[410px] text-[clamp(1rem,1.2vw,1.28rem)] font-semibold leading-[1.06] text-primary">
            Kami mengundang generasi muda yang siap belajar dan berkembang untuk
            bergabung dalam program magang Kementerian Hukum. Jadilah bagian
            dari perubahan yang membawa dampak nyata bagi masyarakat.
          </p>
        </div>
      </article>

      <article className="min-h-[340px] overflow-hidden rounded-[28px] bg-primary-light lg:min-h-[405px]">
        <img
          className="h-full min-h-[340px] w-full object-cover lg:min-h-[405px]"
          src={infoCardImage}
          alt="Informasi program magang Kementerian Hukum"
        />
      </article>
    </section>
  )
}

export default HomeInfoCards
