import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Settings as SettingsIcon, Save, Loader2, User, Briefcase } from 'lucide-react'
import { getSettings, updateSettings, SettingsData } from '../../services/settingsService'

const Settings = () => {
  const [settings, setSettings] = useState<SettingsData>({
    pejabat_name: '',
    pejabat_position: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const data = await getSettings()
      setSettings(data)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal memuat pengaturan')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!settings.pejabat_name.trim() || !settings.pejabat_position.trim()) {
      toast.error('Semua kolom wajib diisi')
      return
    }

    setSaving(true)
    try {
      await updateSettings(settings)
      toast.success('Pengaturan berhasil disimpan')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan pengaturan')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <SettingsIcon size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-text">Pengaturan Sistem</h1>
          <p className="text-sm text-neutral-muted">Kelola konfigurasi surat dan aplikasi</p>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-border bg-white shadow-sm overflow-hidden">
        <div className="border-b border-neutral-border bg-neutral-bg/50 px-6 py-4">
          <h2 className="font-semibold text-neutral-text">Pengaturan Template Surat</h2>
          <p className="mt-1 text-xs text-neutral-muted">
            Data ini akan digunakan untuk mengganti placeholder pejabat pada saat generate dokumen surat (contoh: surat izin magang/penelitian).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-text flex items-center gap-2">
                <User size={16} className="text-primary" />
                Nama Pejabat
              </label>
              <input
                type="text"
                name="pejabat_name"
                value={settings.pejabat_name}
                onChange={handleChange}
                placeholder="Misal: R. Prasetyo Wibowo"
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-text flex items-center gap-2">
                <Briefcase size={16} className="text-primary" />
                Jabatan
              </label>
              <input
                type="text"
                name="pejabat_position"
                value={settings.pejabat_position}
                onChange={handleChange}
                placeholder="Misal: Kepala Bagian Tata Usaha dan Umum"
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
                required
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-dark focus:ring-4 focus:ring-primary/30 disabled:opacity-70 disabled:cursor-not-allowed shadow-button"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Simpan Pengaturan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Settings
