import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // react-draggable 4.7 membaca flag debug Node.js di browser.
  // Ganti flag tersebut saat source dan dependency diproses oleh Vite.
  define: {
    'process.env.DRAGGABLE_DEBUG': 'false',
  },
  optimizeDeps: {},

  build: {
    rollupOptions: {
      output: {
        // ── Manual Chunks: Vendor Cache Splitting ────────────────────────────
        // Rolldown (Vite 8) mensyaratkan manualChunks berupa fungsi.
        // Gunakan parsing path yang kompatibel Windows & Linux.
        manualChunks(id) {
          // Hanya proses modul yang berasal dari node_modules
          if (!id.includes('node_modules')) return undefined

          // Ekstrak nama package dari path (kompatibel / dan \ )
          const parts = id.split(/[/\\]/)
          const nmIdx = parts.lastIndexOf('node_modules')
          if (nmIdx === -1) return undefined

          const pkg = parts[nmIdx + 1]
          const scopedPkg = pkg?.startsWith('@')
            ? `${pkg}/${parts[nmIdx + 2]}`
            : pkg

          if (!scopedPkg) return undefined

          // pdfjs-dist: hanya dipakai di halaman Sertifikat (admin, lazy-loaded)
          if (scopedPkg === 'pdfjs-dist') return 'vendor-pdfjs'

          // framer-motion: animasi di beberapa halaman publik
          if (scopedPkg === 'framer-motion') return 'vendor-framer'

          // lucide-react: icon library, dipakai hampir semua halaman
          if (scopedPkg === 'lucide-react') return 'vendor-lucide'

          // React core ecosystem
          if (['react', 'react-dom', 'scheduler'].includes(scopedPkg)) return 'vendor-react'

          // React Router
          if (scopedPkg === 'react-router-dom' || scopedPkg === 'react-router') return 'vendor-router'

          // TanStack React Query
          if (scopedPkg === '@tanstack/react-query') return 'vendor-query'

          // Zustand
          if (scopedPkg === 'zustand') return 'vendor-zustand'

          // Form libraries
          if (['react-hook-form', 'zod', '@hookform/resolvers'].includes(scopedPkg)) return 'vendor-form'

          // Pusher + Laravel Echo (real-time chat)
          if (['pusher-js', 'laravel-echo'].includes(scopedPkg)) return 'vendor-realtime'

          return undefined
        },
      },
    },
  },

  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      '/sanctum': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
