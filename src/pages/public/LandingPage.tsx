import PublicFooter from '../../components/common/PublicFooter'
import PublicHeroLayout from '../../components/common/PublicHeroLayout'
import InfoCards from '../../components/public/home/InfoCards'
import Intro from '../../components/public/home/Intro'

const LandingPage = () => {
  return (
    <PublicHeroLayout>
      <main className="bg-neutral-card px-6 lg:px-12">
        <Intro />
        <section className="pb-20 lg:pb-32">
          <InfoCards />
        </section>
      </main>
      <PublicFooter />
    </PublicHeroLayout>
  )
}

export default LandingPage
