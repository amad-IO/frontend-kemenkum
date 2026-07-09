import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  X,
  ChevronRight,
  Briefcase,
} from 'lucide-react'
import { toast } from 'react-toastify'
import useAuthStore from '../../store/authStore'
import api from '../../services/api'
import logo1 from '../../assets/logo 1.svg'

const navItems = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'List Pendaftar', to: '/admin/pendaftar', icon: Users },
  { label: 'Kelola Program', to: '/admin/program', icon: Briefcase },
  { label: 'Setting Form', to: '/admin/setting-form', icon: Settings },
]

interface SidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const navigate = useNavigate()
  const { logout, admin } = useAuthStore()

  const handleLogout = async () => {
    try {
      await api.post('/admin/logout')
    } catch {
      // tetap logout meski request gagal
    }
    logout()
    toast.info('Anda telah keluar.')
    navigate('/admin/login', { replace: true })
  }

  const adminName = (admin as Record<string, string> | null)?.name ?? 'Administrator'
  const adminEmail = (admin as Record<string, string> | null)?.email ?? ''

  return (
    <>
      {/* ── Overlay mobile ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-neutral-border bg-neutral-card shadow-soft transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 border-b border-neutral-border px-6 py-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black">
            <img src={logo1} alt="Logo" className="h-7 w-7" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-extrabold text-neutral-text">Ruang Magang</p>
            <p className="text-[10px] text-neutral-muted">Admin Panel</p>
          </div>
          <button
            className="ml-auto text-neutral-muted hover:text-primary lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-neutral-muted">
            Menu Utama
          </p>
          <ul className="flex flex-col gap-0.5">
            {navItems.map(({ label, to, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-primary text-white shadow-card'
                        : 'text-neutral-subtle hover:bg-neutral-bg hover:text-primary'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={17} className="shrink-0" />
                      <span className="flex-1">{label}</span>
                      {isActive && <ChevronRight size={14} className="opacity-70" />}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User info + Logout */}
        <div className="border-t border-neutral-border p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-neutral-bg px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20">
              <span className="text-xs font-bold text-primary">
                {adminName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-neutral-text">{adminName}</p>
              <p className="truncate text-[10px] text-neutral-muted">{adminEmail}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-500 transition-all hover:bg-red-50"
          >
            <LogOut size={16} />
            Keluar
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
