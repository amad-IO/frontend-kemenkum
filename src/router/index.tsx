import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import useAuthStore from '../store/authStore'
import { useIsMobileDevice } from '../hooks/useIsMobileDevice'
import MobileBlockPage from '../pages/admin/MobileBlockPage'

// Public Pages — lazy loaded (tidak di-download sampai halaman dikunjungi)
const LandingPage        = lazy(() => import('../pages/public/LandingPage'))
const DaftarPage         = lazy(() => import('../pages/public/DaftarPage'))
const FormMagangPage     = lazy(() => import('../pages/public/FormMagangPage'))
const FormPenelitianPage = lazy(() => import('../pages/public/FormPenelitianPage'))
const CheckStatusPage    = lazy(() => import('../pages/public/CheckStatusPage'))

// Admin Pages — lazy loaded (tidak di-download oleh pengunjung publik)
const Login              = lazy(() => import('../pages/admin/Login'))
const Dashboard          = lazy(() => import('../pages/admin/Dashboard'))
const KelolaProgramPage  = lazy(() => import('../pages/admin/KelolaProgram'))
const ListPendaftarPage  = lazy(() => import('../pages/admin/ListPendaftar'))
const CertificateSettingPage = lazy(() => import('../pages/admin/CertificateSetting'))

import AdminLayout from '../components/admin/AdminLayout'

// Fallback loading spinner saat chunk sedang di-download
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-neutral-bg">
    <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
)

const withSuspense = (element: ReactNode) => (
  <Suspense fallback={<PageLoader />}>{element}</Suspense>
)

// ── Guard 1: Hanya boleh login admin ─────────────────────────────────────────
type ProtectedRouteProps = {
  children: ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />
}

// ── Guard 2: Blokir smartphone dari SEMUA halaman admin ──────────────────────
// Tablet (iPad, Android tablet ≥ 768px) dan desktop tetap diizinkan.
// Jika diakses dari smartphone → tampilkan MobileBlockPage, tidak bisa lanjut.
const AdminDeviceGuard = ({ children }: ProtectedRouteProps) => {
  // const isMobile = useIsMobileDevice()
  // return isMobile ? <MobileBlockPage /> : <>{children}</>
  return <>{children}</>
}

const router = createBrowserRouter([
  // ─── Public Routes ───────────────────────────────
  {
    path: '/',
    element: withSuspense(<LandingPage />),
  },
  {
    path: '/daftar',
    element: withSuspense(<DaftarPage />),
  },
  {
    path: '/status',
    element: withSuspense(<CheckStatusPage />),
  },
  {
    path: '/daftar/magang/:id',
    element: withSuspense(<FormMagangPage />),
  },
  {
    path: '/daftar/penelitian/:id',
    element: withSuspense(<FormPenelitianPage />),
  },

  // ─── Admin Routes ────────────────────────────────
  // Semua route admin dibungkus AdminDeviceGuard.
  // Smartphone → MobileBlockPage. Tablet/Desktop → lanjut normal.
  {
    path: '/admin/login',
    element: (
      <AdminDeviceGuard>
        {withSuspense(<Login />)}
      </AdminDeviceGuard>
    ),
  },
  {
    path: '/admin',
    element: (
      <AdminDeviceGuard>
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      </AdminDeviceGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: withSuspense(<Dashboard />) },
      { path: 'program',   element: withSuspense(<KelolaProgramPage />) },
      { path: 'pendaftar', element: withSuspense(<ListPendaftarPage />) },
      { path: 'sertifikat', element: withSuspense(<CertificateSettingPage />) },
    ],
  },
])

const AppRouter = () => <RouterProvider router={router} />

export default AppRouter
