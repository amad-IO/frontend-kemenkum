import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-bg px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <h2 className="text-3xl font-semibold mt-4 text-gray-800">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-500 mt-4 mb-8 max-w-md mx-auto">
          Maaf, halaman yang Anda cari tidak ada atau URL yang dimasukkan salah.
        </p>
        <div className="flex justify-center mt-6">
          <Link 
            to="/" 
            className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-opacity-90 transition-colors inline-block"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
