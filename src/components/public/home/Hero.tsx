import PublicLogo from '../../common/PublicLogo'
import heroImage from '../../../assets/o1.webp'

const Hero = () => {
  return (
    <section
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,rgba(0,0,0,0.34)_0%,rgba(0,0,0,0.18)_42%,rgba(33,29,27,0.62)_100%),linear-gradient(90deg,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.34)_44%,rgba(0,0,0,0.04)_100%)] px-7 pb-32 pt-8 sm:px-12 sm:pt-10 lg:px-[clamp(56px,7vw,104px)] lg:pt-12">
        <PublicLogo className="h-auto w-36 sm:w-44 lg:w-[206px]" />

        <h1 className="mt-[18vh] max-w-none pl-[clamp(42px,17vw,330px)] text-left text-[clamp(1.25rem,2.8vw,2.55rem)] font-bold italic leading-[1.12] text-neutral-card drop-shadow-[0_2px_4px_rgba(0,0,0,0.24)]">
          <span className="block whitespace-nowrap">— Mulai langkah awal</span>
          <span className="block whitespace-nowrap">
            untuk meniti dan mengembangkan
          </span>
          <span className="block whitespace-nowrap">
            karir profesional Anda di bidang hukum
          </span>
        </h1>
      </div>
    </section>
  )
}

export default Hero
