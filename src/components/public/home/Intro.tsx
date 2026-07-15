import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import PhotoCard from './PhotoCard'
import introCard from "../../../assets/02.webp"

const renderHoverWords = (text: string, className = '') => {
  const words = text.split(' ')

  return words.map((word, index) => (
    <span
      key={`${word}-${index}`}
      className={`inline-block cursor-default transition-transform duration-300 ease-out hover:-translate-y-2 ${className}`}
    >
      {word}
      {index < words.length - 1 ? '\u00A0' : ''}
    </span>
  ))
}

const Intro = () => {
  const cardRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start'],
  })

  // Rotate from 12deg (entering at bottom) -> 0deg (fully visible) -> 12deg (leaving at top)
  const rotate = useTransform(scrollYProgress, [0, 0.35, 0.85, 1], [12, 0, 0, 12])

  return (
    <section
      className="mx-auto mb-20 mt-10 grid max-w-[1210px] items-center gap-12 px-6 sm:mt-14 lg:mb-32 lg:mt-16 lg:grid-cols-[minmax(240px,420px)_minmax(0,1fr)] lg:gap-[clamp(48px,8vw,132px)] lg:px-0"
      id="registration"
    >
      <div className="flex justify-center lg:justify-start">
        {/* Mobile: Scroll Animation (Hidden on Desktop) */}
        <motion.div ref={cardRef} style={{ rotate }} className="origin-bottom-right lg:hidden">
          <PhotoCard
            imageSrc={introCard}
            imageAlt="Mahasiswa berdiskusi dalam program magang"
            caption="Buka potensi Anda dan rasakan pengalaman kerja profesional bersama Kementerian Hukum."
            className="cursor-pointer drop-shadow-[0_32px_48px_rgba(110,71,59,0.18)]"
          />
        </motion.div>

        {/* Desktop: Hover Animation (Hidden on Mobile) */}
        <div className="hidden origin-bottom-right rotate-[8deg] transition-transform duration-500 ease-out hover:rotate-0 lg:block">
          <PhotoCard
            imageSrc={introCard}
            imageAlt="Mahasiswa berdiskusi dalam program magang"
            caption="Buka potensi Anda dan rasakan pengalaman kerja profesional bersama Kementerian Hukum."
            className="cursor-pointer drop-shadow-[0_32px_48px_rgba(110,71,59,0.18)]"
          />
        </div>
      </div>

      <div className="flex flex-col gap-6 text-left">
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          viewport={{ once: true, margin: '-50px' }}
          className="flex justify-start"
        >
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#6E473B]/10 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-primary whitespace-nowrap sm:px-4 sm:text-[0.78rem] sm:tracking-[0.12em]">
            Program Resmi Kementerian Hukum
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
          viewport={{ once: true, margin: '-50px' }}
          className="max-w-[680px] text-[clamp(1.4rem,4.5vw,3.2rem)] font-extrabold leading-[1.12] tracking-[-0.02em] text-[#211D1B]"
        >
          {renderHoverWords('Eksplorasi ruang belajar')}{' '}
          {renderHoverWords('profesional,', 'text-primary')}{' '}
          {renderHoverWords('kembangkan inovasi bersama para ahli, dan bangun')}{' '}
          {renderHoverWords('fondasi karir masa depan', 'italic font-medium text-[#6E473B]/70')}{' '}
          {renderHoverWords('Anda di sini.')}
        </motion.h2>

        <div className="mt-2 flex flex-wrap justify-center gap-2.5 lg:justify-start">
          {['Kerja Praktik', 'Penelitian Akademik', 'Pengembangan Karir'].map((tag, index) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 + index * 0.15 }}
              viewport={{ once: true, margin: '-50px' }}
              className="rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[0.82rem] font-semibold tracking-wide text-primary transition-colors hover:bg-primary/10"
            >
              {tag}
            </motion.span>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.65 }}
          viewport={{ once: true, margin: '-50px' }}
          className="mt-4 flex justify-center lg:justify-start"
        >
          <Link
            to="/daftar"
            className="group inline-flex items-center justify-center gap-4 rounded-2xl bg-primary px-9 py-4 text-[1.1rem] font-bold tracking-wide text-white shadow-[0_8px_32px_rgba(110,71,59,0.30)] transition-all duration-300 hover:-translate-y-1 hover:bg-primary-dark hover:shadow-[0_12px_40px_rgba(110,71,59,0.40)] sm:text-[1.15rem]"
          >
            <span>Daftar Sekarang</span>
            <ArrowRight
              size={20}
              strokeWidth={2.5}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default Intro
