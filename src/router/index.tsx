import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import useAuthStore from '../store/authStore'

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
const SettingsPage       = lazy(() => import('../pages/admin/Settings'))

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

// Guard route admin
type ProtectedRouteProps = {
  children: ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />
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
  {
    path: '/admin/login',
    element: withSuspense(<Login />),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: withSuspense(<Dashboard />) },
      { path: 'program', element: withSuspense(<KelolaProgramPage />) },
      { path: 'pendaftar', element: withSuspense(<ListPendaftarPage />) },
      { path: 'settings', element: withSuspense(<SettingsPage />) },
    ],
  },
])

const AppRouter = () => <RouterProvider router={router} />

export default AppRouter
