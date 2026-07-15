import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Registration', to: '/daftar' },
  { label: 'Check Status', to: '/status' },
]

const Navbar = () => {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/' && !location.hash
    if (to.startsWith('#')) return location.hash === to
    return location.pathname.startsWith(to)
  }

  const toggleMenu = () => setIsOpen(!isOpen)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (target.closest('#hamburger-toggle')) return
      
      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav
      className="relative flex items-center justify-between py-3 lg:min-h-16 lg:py-4"
      aria-label="Navigasi publik"
    >
      {/* Background Overlay for Mobile Menu */}
      <div 
        className={`absolute top-full left-1/2 -translate-x-1/2 w-[100vw] h-[150dvh] z-40 bg-[#FAF8F4]/60 backdrop-blur-md transition-all duration-300 lg:hidden ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        aria-hidden="true"
        onClick={() => setIsOpen(false)}
      />

      <div className="relative z-50 flex min-w-0 flex-1 items-center gap-4 text-xl font-bold italic text-primary sm:text-2xl lg:text-[1.7rem]">
        <span className="shrink-0">Kementerian Hukum</span>
        <span className="hidden h-px flex-1 rounded-full bg-primary/80 sm:block" aria-hidden="true" />
      </div>
      
      {/* Hamburger Menu Button */}
      <button
        id="hamburger-toggle"
        onClick={toggleMenu}
        className="relative z-50 ml-4 flex h-10 w-10 items-center justify-center text-primary focus:outline-none lg:hidden"
        aria-label={isOpen ? 'Tutup menu' : 'Buka menu'}
      >
        <Menu 
          size={28} 
          className={`absolute transition-all duration-300 ${
            isOpen ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`} 
        />
        <X 
          size={28} 
          className={`absolute transition-all duration-300 ${
            isOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
          }`} 
        />
      </button>

      {/* Navigation Links (Floating on Mobile) */}
      <div
        ref={menuRef}
        className={`absolute right-0 top-full z-50 mt-3 flex w-[220px] flex-col gap-3 rounded-[24px] bg-neutral-card p-5 shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out origin-top-right lg:static lg:mt-0 lg:w-auto lg:flex-row lg:items-center lg:justify-end lg:gap-3 lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none lg:scale-100 lg:opacity-100 lg:visible lg:ml-6 ${
          isOpen ? 'scale-100 opacity-100 visible' : 'scale-95 opacity-0 invisible'
        }`}
      >
        {navItems.map((item) => {
          const active = isActive(item.to)
          const className = `flex min-h-11 items-center justify-center rounded-xl border px-4 py-2 text-center text-sm font-bold leading-none transition duration-200 lg:min-h-10 lg:min-w-32 lg:px-5 lg:py-0 ${
            active
              ? 'border-primary bg-primary text-neutral-card shadow-card'
              : 'border-neutral-border bg-neutral-soft text-primary hover:-translate-y-0.5 hover:bg-primary hover:text-neutral-card'
          }`

          return item.to.startsWith('#') ? (
            <a
              key={item.label}
              href={item.to}
              onClick={() => setIsOpen(false)}
              className={className}
              aria-current={active ? 'page' : undefined}
            >
              {item.label}
            </a>
          ) : (
            <Link
              key={item.label}
              to={item.to}
              onClick={() => setIsOpen(false)}
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

export default Navbar
