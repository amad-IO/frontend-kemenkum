import regenciesCsv from 'idn-area-data/data/regencies.csv?raw'

const PROVINCE_PRIORITY: Record<string, number> = {
  '35': 0, // Jawa Timur
  '32': 1, // Jawa Barat
  '33': 2, // Jawa Tengah
}

export const INDONESIA_REGENCIES = regenciesCsv
  .trim()
  .split('\n')
  .slice(1)
  .map((row) => {
    const [code, provinceCode, fullName] = row.replace(/\r$/, '').split(',')
    return {
      code,
      provinceCode,
      name: fullName?.replace(/^(Kabupaten|Kota)\s+/i, '') ?? '',
    }
  })
  .filter((area) => Boolean(area.code && area.name))
  .filter((area, index, areas) =>
    areas.findIndex((candidate) =>
      candidate.name.toLocaleLowerCase('id') === area.name.toLocaleLowerCase('id'),
    ) === index,
  )
  .sort((a, b) => {
    const priorityA = PROVINCE_PRIORITY[a.provinceCode] ?? 3
    const priorityB = PROVINCE_PRIORITY[b.provinceCode] ?? 3
    return priorityA - priorityB || a.name.localeCompare(b.name, 'id')
  })

// Alias untuk kompatibilitas dengan modul lama yang masih tersimpan oleh Vite HMR.
export const INDONESIA_CITIES = INDONESIA_REGENCIES.map((area) => area.name)

export const EDUCATION_LEVELS = ['SMA', 'SMK', 'D3', 'D4', 'S1', 'S2', 'S3', 'Umum/Profesional/Dosen'] as const
