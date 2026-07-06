import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

// Public Pages
import LandingPage from '../pages/public/LandingPage'
import DetailProgram from '../pages/public/DetailProgram'
import FormMagang from '../pages/public/FormMagang'
import FormPenelitian from '../pages/public/FormPenelitian'
import Konfirmasi from '../pages/public/Konfirmasi'

// Admin Pages
import Login from '../pages/admin/Login'
import Dashboard from '../pages/admin/Dashboard'
import KelolaProgram from '../pages/admin/KelolaProgram'
import ListPendaftar from '../pages/admin/ListPendaftar'
import SettingForm from '../pages/admin/SettingForm'

// Layout
import AdminLayout from '../components/admin/AdminLayout'

// Guard route admin
const ProtectedRoute = ({ children }) => {
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
    path: '/program/:id',
    element: <DetailProgram />,
  },
  {
    path: '/daftar/magang/:id',
    element: <FormMagang />,
  },
  {
    path: '/daftar/penelitian/:id',
    element: <FormPenelitian />,
  },
  {
    path: '/konfirmasi',
    element: <Konfirmasi />,
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
      { path: 'program', element: <KelolaProgram /> },
      { path: 'pendaftar', element: <ListPendaftar /> },
      { path: 'setting-form', element: <SettingForm /> },
    ],
  },
])

const AppRouter = () => <RouterProvider router={router} />

export default AppRouter
