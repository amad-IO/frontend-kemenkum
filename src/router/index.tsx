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
const NotFoundPage       = lazy(() => import('../pages/public/NotFoundPage'))

// Admin Pages — lazy loaded (tidak di-download oleh pengunjung publik)
const Login              = lazy(() => import('../pages/admin/Login'))
const Dashboard          = lazy(() => import('../pages/admin/Dashboard'))
const KelolaProgramPage  = lazy(() => import('../pages/admin/KelolaProgram'))
const ListPendaftarPage  = lazy(() => import('../pages/admin/ListPendaftar'))
const CertificateSettingPage = lazy(() => import('../pages/admin/CertificateSetting'))

import AdminLayout from '../components/admin/AdminLayout'

import { Skeleton } from '../components/ui/Skeleton'

// Fallback loading spinner untuk halaman publik
const PublicPageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-neutral-bg">
    <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
)

// Fallback skeleton untuk halaman admin saat di-lazy load
const AdminPageLoader = () => (
  <div className="flex flex-col gap-6">
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-8 w-40 mb-1" />
        <Skeleton className="h-4 w-64" />
      </div>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
         <Skeleton key={i} className="h-24 w-full rounded-2xl" />
      ))}
    </div>
  </div>
)

const withPublicSuspense = (element: ReactNode) => (
  <Suspense fallback={<PublicPageLoader />}>{element}</Suspense>
)

const withAdminSuspense = (element: ReactNode) => (
  <Suspense fallback={<AdminPageLoader />}>{element}</Suspense>
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
    element: withPublicSuspense(<LandingPage />),
  },
  {
    path: '/daftar',
    element: withPublicSuspense(<DaftarPage />),
  },
  {
    path: '/status',
    element: withPublicSuspense(<CheckStatusPage />),
  },
  {
    path: '/daftar/magang/:id',
    element: withPublicSuspense(<FormMagangPage />),
  },
  {
    path: '/daftar/penelitian/:id',
    element: withPublicSuspense(<FormPenelitianPage />),
  },

  // ─── Admin Routes ────────────────────────────────
  // Semua route admin dibungkus AdminDeviceGuard.
  // Smartphone → MobileBlockPage. Tablet/Desktop → lanjut normal.
  {
    path: '/admin/login',
    element: (
      <AdminDeviceGuard>
        {withPublicSuspense(<Login />)}
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
      { path: 'dashboard', element: withAdminSuspense(<Dashboard />) },
      { path: 'program',   element: withAdminSuspense(<KelolaProgramPage />) },
      { path: 'pendaftar', element: withAdminSuspense(<ListPendaftarPage />) },
      { path: 'sertifikat', element: withAdminSuspense(<CertificateSettingPage />) },
    ],
  },
  
  // ─── Catch-all 404 Route ───────────────────────────────────
  {
    path: '*',
    element: withPublicSuspense(<NotFoundPage />),
  }
])

const AppRouter = () => <RouterProvider router={router} />

export default AppRouter
