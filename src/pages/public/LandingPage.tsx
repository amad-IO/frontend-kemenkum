import PublicFooter from '../../components/common/PublicFooter'
import PublicNavbar from '../../components/common/PublicNavbar'
import HomeHero from '../../components/public/HomeHero'
import HomeInfoCards from '../../components/public/HomeInfoCards'
import HomeIntro from '../../components/public/HomeIntro'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-neutral-card">
      {/* Hero dengan background image */}
      <HomeHero />

      {/* Wrapper dengan strip gelap tipis di belakang radius navbar */}
      <div className="relative -mt-10 sm:-mt-14 lg:-mt-16">
        {/* Strip gelap yang mengisi sudut radius navbar */}
        <div className="absolute inset-x-0 top-0 h-16 bg-[#211D1B] -z-10" />

        {/* Navbar dengan radius pojok kiri & kanan atas */}
        <header className="sticky top-0 z-50 bg-neutral-card rounded-tl-[40px] rounded-tr-[40px] sm:rounded-tl-[56px] sm:rounded-tr-[56px] lg:rounded-tl-[72px] lg:rounded-tr-[72px]">
          <div className="mx-auto max-w-[1330px] px-6 lg:px-12">
            <PublicNavbar />
          </div>
        </header>

        {/* Konten menyatu langsung */}
        <main className="bg-neutral-card px-6 lg:px-12">
          <HomeIntro />
          <section className="pb-20 lg:pb-32">
            <HomeInfoCards />
          </section>
        </main>
      </div>

      {/* Footer */}
      <PublicFooter />
    </div>
  )
}

export default LandingPage
