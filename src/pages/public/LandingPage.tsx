import Footer from './components/layout/Footer'
import HeroLayout from './components/layout/HeroLayout'
import InfoCards from './components/home/InfoCards'
import Intro from './components/home/Intro'
import homeHeroImage from '../../assets/o1.webp'

const homeTitle = [
  '— Mulai langkah awal',
  'untuk meniti dan mengembangkan',
  'karir profesional Anda di bidang hukum',
]

const LandingPage = () => {
  return (
    <HeroLayout image={homeHeroImage} title={homeTitle}>
      <main className="bg-neutral-card px-6 lg:px-12">
        <Intro />
        <section className="pb-20 lg:pb-32">
          <InfoCards />
        </section>
      </main>
      <Footer />
    </HeroLayout>
  )
}

export default LandingPage
