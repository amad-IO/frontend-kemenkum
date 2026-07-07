import { Outlet } from 'react-router-dom'

// Layout wrapper untuk semua halaman admin
// Berisi Sidebar + konten utama
const AdminLayout = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar akan diisi nanti */}
      <aside style={{ width: 240, background: '#1a3c6e' }}>
        {/* Sidebar Admin */}
      </aside>
      <main style={{ flex: 1, padding: 24 }}>
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
