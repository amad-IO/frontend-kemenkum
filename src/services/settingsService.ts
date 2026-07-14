import api from './api'

export interface SettingsData {
  pejabat_name: string
}

export const getSettings = async (): Promise<SettingsData> => {
  const { data } = await api.get('/admin/settings')
  return {
    pejabat_name: data.data.pejabat_name || 'R. Prasetyo Wibowo',
  }
}

export const updateSettings = async (settings: SettingsData): Promise<void> => {
  await api.put('/admin/settings', settings)
}
