import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Settings as SettingsIcon, Save, Loader2, User, Briefcase } from 'lucide-react'
import { getSettings, updateSettings, SettingsData } from '../../services/settingsService'

const Settings = () => {
  const [settings, setSettings] = useState<SettingsData>({
    pejabat_name: '',
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
    if (!settings.pejabat_name.trim()) {
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
      <div className="mb-8 max-w-2xl animate-pulse">
        <div className="mb-5">
          <div className="h-6 w-64 rounded-md bg-neutral-bg" />
          <div className="mt-2 h-4 w-full max-w-md rounded-md bg-neutral-bg" />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <div className="h-5 w-32 rounded-md bg-neutral-bg" />
            <div className="h-[42px] w-full rounded-xl bg-neutral-bg" />
          </div>
          <div className="h-[42px] w-28 shrink-0 rounded-xl bg-neutral-bg" />
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8 max-w-2xl">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-neutral-text flex items-center gap-2">
          <SettingsIcon size={20} className="text-primary" />
          Pengaturan Template Surat
        </h2>
        <p className="mt-1.5 text-sm text-neutral-muted leading-relaxed">
          Data ini akan digunakan untuk mengganti nama pejabat pada template surat. Pastikan data yang dimasukkan sudah benar.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-bold text-neutral-text flex items-center gap-2">
              <User size={16} className="text-neutral-muted" />
              Nama Pejabat
            </label>
            <input
              type="text"
              name="pejabat_name"
              value={settings.pejabat_name}
              onChange={handleChange}
              placeholder="Misal: R. Prasetyo Wibowo"
              className="w-full rounded-xl border border-neutral-300 bg-white/60 px-4 py-2.5 text-sm transition-all focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/20 hover:bg-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save size={16} />
                Simpan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Settings
