import { Link } from 'react-router-dom'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Guideline', to: '#guideline' },
  { label: 'Registration', to: '/daftar' },
]

const PublicNavbar = () => {
  return (
    <nav
      className="flex min-h-14 flex-col gap-4 py-4 sm:min-h-16 lg:min-h-[76px] lg:flex-row lg:items-center lg:gap-12 lg:py-0"
      aria-label="Navigasi publik"
    >
      <div className="flex min-w-72 flex-1 items-center gap-7 text-[clamp(1.35rem,2vw,2.25rem)] font-bold italic text-primary">
        <span>Kementerian Hukum</span>
        <span className="h-[3px] flex-1 rounded-full bg-primary" aria-hidden="true" />
      </div>

      <div className="flex flex-wrap items-center gap-4 lg:justify-end">
        {navItems.map((item) =>
          item.to.startsWith('#') ? (
            <a
              key={item.label}
              href={item.to}
              className="w-full min-w-32 rounded-2xl border border-neutral-border bg-neutral-soft px-5 py-2 text-center text-base font-bold leading-none text-primary transition duration-200 hover:-translate-y-0.5 hover:bg-primary hover:text-neutral-card sm:w-auto lg:min-w-[142px] lg:px-7 lg:py-2.5 lg:text-lg"
            >
              {item.label}
            </a>
          ) : (
            <Link
              key={item.label}
              to={item.to}
              className="w-full min-w-32 rounded-2xl border border-neutral-border bg-neutral-soft px-5 py-2 text-center text-base font-bold leading-none text-primary transition duration-200 hover:-translate-y-0.5 hover:bg-primary hover:text-neutral-card sm:w-auto lg:min-w-[142px] lg:px-7 lg:py-2.5 lg:text-lg"
            >
              {item.label}
            </Link>
          )
        )}
      </div>
    </nav>
  )
}

export default PublicNavbar
