import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, Monitor } from 'lucide-react'
import { toast } from 'react-toastify'
import useAuthStore from '../../store/authStore'
import api from '../../services/api'
import Logo from '../../shared/Logo'
import DinoRunner from '../../components/admin/DinoRunner'

const loginSchema = z.object({
  username: z
    .string()
    .min(3, 'Username minimal 3 karakter')
    .max(50, 'Username maksimal 50 karakter')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh huruf, angka, dan underscore (_)'),
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .max(100, 'Password maksimal 100 karakter'),
})
type LoginForm = z.infer<typeof loginSchema>

// Deteksi mobile: lebar layar < 1024px dianggap smartphone/tablet kecil
const isMobileDevice = () => window.innerWidth < 1024

const Login = () => {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [showPass, setShowPass] = useState(false)
  // Langsung blokir jika dibuka dari perangkat mobile
  const [showMobileBlock, setShowMobileBlock] = useState(isMobileDevice)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (values: LoginForm) => {
    try {
      // 1. Dapatkan CSRF Cookie dari Laravel Sanctum
      await api.get('/sanctum/csrf-cookie', { baseURL: '' })

      // 2. Lakukan proses login (akan menyertakan XSRF-TOKEN otomatis)
      const res = await api.post('/admin/login', values)
      const { user } = res.data.data

      // 3. Simpan data user (token dihapus karena sudah via cookie)
      setAuth(user)

      toast.success('Selamat datang kembali!')
      navigate('/admin/dashboard', { replace: true })
    } catch (err: any) {
      // Fallback: jika backend masih mengembalikan 403 MOBILE_ACCESS_DENIED
      if (err.response?.status === 403 && err.response?.data?.error === 'MOBILE_ACCESS_DENIED') {
        setShowMobileBlock(true)
        return
      }
      const msg = err.response?.data?.message
        || err.response?.data?.errors?.username?.[0]
        || 'Username atau password salah.'
      toast.error(msg)
    }
  }

  // ── Tampilan blokir mobile ─────────────────────────────────────────────────
  if (showMobileBlock) {
    return (
      <main className="admin-login-page font-sans">
        <div style={{ minHeight: '100svh' }} className="flex flex-col items-center justify-center gap-8 bg-[#faf9f7] px-8 text-center">
          {/* Ilustrasi monitor */}
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-[#6e473b]/10">
            <Monitor size={44} className="text-[#6e473b]" />
          </div>

          {/* Teks */}
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#181513]">
              Gunakan Desktop atau Laptop
            </h1>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-neutral-500">
              Panel admin Kemenkuham dirancang untuk layar yang lebih lebar.
              Buka halaman ini di <strong>komputer, laptop, atau tablet</strong> Anda.
            </p>
          </div>

          {/* Info URL */}
          <div className="w-full max-w-xs rounded-2xl border border-neutral-200 bg-white p-4 text-left">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
              Alamat halaman ini
            </p>
            <p className="break-all font-mono text-xs text-[#6e473b]">
              {window.location.href}
            </p>
          </div>

          <p className="text-xs text-neutral-400">
            Hubungi pengelola sistem jika mengalami kendala.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="admin-login-page font-sans">
      <section className="admin-login-shell">
        <aside className="admin-login-visual relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col xl:p-16">
          <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:9px_9px]" />
          <div className="relative z-10">
            <Logo variant="full" className="h-auto w-[190px]" />
            <h1 className="mt-16 max-w-none text-5xl font-semibold leading-[1.18] tracking-[-0.045em] xl:text-[3.25rem]">
              Kelola pendaftar<br />
              dengan lebih mudah,<br />
              cepat dan terintegrasi.
            </h1>
            <svg className="mt-2 ml-16 h-5 w-64" viewBox="0 0 260 20" fill="none" aria-hidden="true">
              <path d="M3 15C72 2 177 3 257 13" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>

          <DinoRunner />
        </aside>

        <div className="admin-login-form-panel flex items-center justify-center px-6 py-12 sm:px-12 lg:px-14 xl:px-20">
          <div className="admin-login-form-wrap w-full">
            <div className="mb-10 text-center">
              <h2 className="text-4xl font-extrabold tracking-[-0.04em] text-[#181513]">Selamat Datang</h2>
              <p className="mt-3 text-sm text-neutral-400">Silakan masuk dashboard administrator anda</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="admin-login-form flex flex-col gap-4" noValidate>
              <div>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Masukkan username admin"
                  aria-invalid={Boolean(errors.username)}
                  {...register('username')}
                  className="admin-login-input h-[64px] w-full rounded-2xl border border-transparent bg-[#f5f6f7] px-6 text-sm text-[#25201e] outline-none transition placeholder:text-neutral-400 hover:bg-[#f1f2f3] focus:bg-white"
                />
                {errors.username && <p className="mt-2 px-2 text-xs text-red-500">{errors.username.message}</p>}
              </div>

              <div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Masukkan password"
                    aria-invalid={Boolean(errors.password)}
                    {...register('password')}
                    className="admin-login-input h-[64px] w-full rounded-2xl border border-transparent bg-[#f5f6f7] px-6 pr-14 text-sm text-[#25201e] outline-none transition placeholder:text-neutral-400 hover:bg-[#f1f2f3] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute inset-y-0 right-5 flex items-center text-neutral-400 transition hover:text-primary focus:outline-none"
                    aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPass ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
                {errors.password && <p className="mt-2 px-2 text-xs text-red-500">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                id="btn-login"
                disabled={isSubmitting}
                className="admin-login-submit mt-4 flex h-[62px] items-center justify-center gap-3 rounded-2xl px-6 text-sm font-extrabold text-white transition duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? <><Loader2 size={19} className="animate-spin" /> Masuk...</> : 'Masuk'}
              </button>
            </form>
            <p className="mt-8 text-center text-xs leading-5 text-neutral-400">
              Akses hanya untuk administrator sistem.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Login
