import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import useAuthStore from '../store/authStore'

// Public Pages
import LandingPage from '../pages/public/LandingPage'
import DaftarPage from '../pages/public/DaftarPage'
import FormMagangPage from '../pages/public/FormMagangPage'
import FormPenelitianPage from '../pages/public/FormPenelitianPage'
import CheckStatusPage from '../pages/public/CheckStatusPage'

// Admin Pages
import Login from '../pages/admin/Login'
import Dashboard from '../pages/admin/Dashboard'
import KelolaProgramPage from '../pages/admin/KelolaProgram'
import ListPendaftarPage from '../pages/admin/ListPendaftar'

import AdminLayout from '../components/admin/AdminLayout'

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
    element: <LandingPage />,
  },
  {
    path: '/daftar',
    element: <DaftarPage />,
  },
  {
    path: '/status',
    element: <CheckStatusPage />,
  },
  {
    path: '/daftar/magang/:id',
    element: <FormMagangPage />,
  },
  {
    path: '/daftar/penelitian/:id',
    element: <FormPenelitianPage />,
  },

  // ─── Admin Routes ────────────────────────────────
  {
    path: '/admin/login',
    element: <Login />,
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
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'program', element: <KelolaProgramPage /> },
      { path: 'pendaftar', element: <ListPendaftarPage /> },
    ],
  },
])

const AppRouter = () => <RouterProvider router={router} />

export default AppRouter
