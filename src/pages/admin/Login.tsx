import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, Lock, User } from 'lucide-react'
import { toast } from 'react-toastify'
import useAuthStore from '../../store/authStore'
import api from '../../services/api'

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

const Login = () => {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [showPass, setShowPass] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (values: LoginForm) => {
    try {
      // Ambil CSRF Cookie terlebih dahulu
      await api.get('/sanctum/csrf-cookie', {
        baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', ''),
      })

      const res = await api.post('/admin/login', values)
      const { user } = res.data.data
      setAuth(user)
      toast.success('Selamat datang kembali!')
      navigate('/admin/dashboard', { replace: true })
    } catch {
      toast.error('Username atau password salah.')
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-bg px-4">

      {/* ── Background decorative blobs ── */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-[420px] w-[420px] rounded-full bg-secondary/50 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">

        {/* ── Card ── */}
        <div className="rounded-3xl border border-neutral-border bg-neutral-card p-8 shadow-soft sm:p-10">

          {/* Logo & heading */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-card">
              <Lock size={26} className="text-white" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-neutral-text">
              Admin Panel
            </h1>
            <p className="mt-1 text-sm text-neutral-muted">
              Kementerian Hukum dan HAM — Kemenkuham
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-sm font-semibold text-neutral-text">
                Username
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-neutral-muted">
                  <User size={17} />
                </span>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Masukkan username admin"
                  {...register('username')}
                  className="input-field pl-10"
                />
              </div>
              {errors.username && (
                <p className="text-xs text-red-500">{errors.username.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-semibold text-neutral-text">
                Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-neutral-muted">
                  <Lock size={17} />
                </span>
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Masukkan password"
                  {...register('password')}
                  className="input-field pl-10 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute inset-y-0 right-3.5 flex items-center text-neutral-muted hover:text-primary transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="btn-login"
              disabled={isSubmitting}
              className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-base font-bold text-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Masuk...
                </>
              ) : (
                'Masuk ke Dashboard'
              )}
            </button>
          </form>

          {/* Footer note */}
          <p className="mt-6 text-center text-xs text-neutral-muted">
            Akses hanya untuk administrator sistem.
            <br />
            Hubungi IT jika lupa password.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-neutral-muted">
          © 2026 Kementerian Hukum dan HAM RI
        </p>
      </div>
    </div>
  )
}

export default Login
