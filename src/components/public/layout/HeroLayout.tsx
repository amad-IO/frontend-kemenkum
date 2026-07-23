import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Logo from '../../../shared/Logo'
import Navbar from './Navbar'

type HeroLayoutProps = {
  children: ReactNode
  image: string
  title: string | string[]
  subtitle?: string
  badge?: string
}

const HeroLayout = ({ children, image, title, subtitle, badge }: HeroLayoutProps) => {
  const location = useLocation()
  
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  const titleLines = Array.isArray(title) ? title : [title]
  const subtitleWords = subtitle?.split(' ') ?? []

  return (
    <div className="min-h-screen bg-[#211D1B]">
      <section
        key={location.key}
        className="hero-image-enter min-h-screen bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${image})` }}
      >
        <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,rgba(0,0,0,0.34)_0%,rgba(0,0,0,0.18)_42%,rgba(33,29,27,0.62)_100%),linear-gradient(90deg,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.34)_44%,rgba(0,0,0,0.04)_100%)] px-7 pb-32 pt-8 sm:px-12 sm:pt-10 lg:px-[clamp(56px,7vw,104px)] lg:pt-12">
          <Logo className="hero-logo-enter h-auto w-36 sm:w-44 lg:w-[206px]" />

          <div className="mt-[18vh] max-w-none pl-0 sm:pl-[clamp(16px,8vw,330px)] text-left text-neutral-card">
            <div className={subtitle ? 'max-w-3xl' : 'max-w-none'}>
              {badge && (
                <span className="hero-badge-enter inline-flex items-center rounded-full bg-neutral-card/15 px-4 py-1.5 text-[clamp(0.65rem,2vw,0.75rem)] font-semibold uppercase tracking-widest text-neutral-card ring-1 ring-neutral-card/35 backdrop-blur">
                  {badge}
                </span>
              )}

              <h1 className={`${subtitle ? 'mt-4 text-[clamp(1.65rem,6vw,3.75rem)] lg:text-6xl' : 'text-[clamp(1rem,3.8vw,2.35rem)]'} font-bold italic leading-[1.08] tracking-normal text-neutral-card drop-shadow-[0_2px_4px_rgba(0,0,0,0.24)]`}>
                {titleLines.map((line, index) => (
                  <span
                    key={line}
                    className="hero-title-line block"
                    style={{ animationDelay: `${360 + index * 260}ms` }}
                  >
                    {line}
                  </span>
                ))}
              </h1>

              {subtitle && (
                <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-card/90 sm:text-base">
                  {subtitleWords.map((word, index) => (
                    <span
                      key={`${word}-${index}`}
                      className="hero-subtitle-word inline-block"
                      style={{ animationDelay: `${680 + index * 85}ms` }}
                    >
                      {word}
                      {index < subtitleWords.length - 1 ? '\u00A0' : ''}
                    </span>
                  ))}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="-mt-12 bg-neutral-card rounded-t-[40px] sm:-mt-14 sm:rounded-t-[56px] lg:-mt-16 lg:rounded-t-[72px]">
        <div className="sticky top-0 z-50 bg-neutral-card rounded-t-[40px] sm:rounded-t-[56px] lg:rounded-t-[72px]">
          <header className="mx-auto w-full max-w-[1330px] px-6 lg:px-12">
            <Navbar />
          </header>
        </div>

        <div className="flow-root flex-1 bg-neutral-card">
          {children}
        </div>
      </div>
    </div>
  )
}

export default HeroLayout
