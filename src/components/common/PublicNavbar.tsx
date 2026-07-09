import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Registration', to: '/daftar' },
  { label: 'Check Status', to: '/status' },
]

const PublicNavbar = () => {
  const location = useLocation()

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/' && !location.hash
    if (to.startsWith('#')) return location.hash === to
    return location.pathname.startsWith(to)
  }

  return (
    <nav
      className="flex min-h-14 flex-col gap-3 py-3 sm:min-h-16 lg:flex-row lg:items-center lg:gap-8 lg:py-4"
      aria-label="Navigasi publik"
    >
      <div className="flex min-w-0 flex-1 items-center gap-4 text-xl font-bold italic text-primary sm:text-2xl lg:text-[1.7rem]">
        <span className="shrink-0">Kementerian Hukum</span>
        <span className="hidden h-px flex-1 rounded-full bg-primary/80 sm:block" aria-hidden="true" />
      </div>

      <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3 lg:justify-end">
        {navItems.map((item) => {
          const active = isActive(item.to)
          const className = `flex min-h-10 items-center justify-center rounded-xl border px-3 py-0 text-center text-sm font-bold leading-none transition duration-200 sm:min-w-28 sm:px-5 lg:min-w-32 ${
            active
              ? 'border-primary bg-primary text-neutral-card shadow-card'
              : 'border-neutral-border bg-neutral-soft text-primary hover:-translate-y-0.5 hover:bg-primary hover:text-neutral-card'
          }`

          return item.to.startsWith('#') ? (
            <a
              key={item.label}
              href={item.to}
              className={className}
              aria-current={active ? 'page' : undefined}
            >
              {item.label}
            </a>
          ) : (
            <Link
              key={item.label}
              to={item.to}
              className={className}
              aria-current={active ? 'page' : undefined}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default PublicNavbar
