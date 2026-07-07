import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BriefcaseBusiness, CalendarDays, Check, ChevronDown, Loader2, Plus, Trash2, Upload, User, Users } from 'lucide-react'
import { toast } from 'react-toastify'
import {
  getPosisiMagang,
  submitPendaftaran,
  type Posisi,
} from '../../../services/daftarService'
import DateRangePickerField from './DateRangePickerField'

const anggotaSchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter'),
  nim: z.string().min(3, 'NIM/NISN tidak valid'),
})

const magangSchema = z
  .object({
    institution: z.string().min(3, 'Nama instansi tidak valid'),
    study_program: z.string().min(2, 'Program studi tidak valid'),
    position_id: z.string().min(1, 'Pilih posisi terlebih dahulu'),
    start_date: z.string().min(1, 'Tanggal mulai wajib dipilih'),
    end_date: z.string().min(1, 'Tanggal selesai wajib dipilih'),
    jenis_peserta: z.enum(['individu', 'kelompok']),
    nama_ketua: z.string().min(2, 'Nama minimal 2 karakter'),
    nim_ketua: z.string().min(3, 'NIM/NISN tidak valid'),
    whatsapp: z.string().min(9, 'Nomor WhatsApp tidak valid'),
    email: z.string().email('Email tidak valid'),
    anggota: z.array(anggotaSchema).max(2),
    letter_number: z.string().min(3, 'Nomor surat tidak valid'),
    document: z
      .instanceof(FileList)
      .refine((f) => f.length > 0, 'File wajib diupload')
      .refine((f) => f[0]?.name.toLowerCase().endsWith('.zip'), 'File harus format .zip'),
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai',
    path: ['end_date'],
  })

type MagangFormValues = z.infer<typeof magangSchema>

interface Props {
  onSuccess: () => void
}

const fieldWrap = 'flex flex-col gap-1.5'
const sectionClass = 'rounded-xl border border-neutral-border bg-white p-4 sm:p-5'
const sectionTitleClass = 'mb-4 flex items-center gap-2 text-base font-bold text-neutral-text'

const FormMagangSection = ({ onSuccess }: Props) => {
  const [posisiList, setPosisiList] = useState<Posisi[]>([])
  const [loadingPosisi, setLoadingPosisi] = useState(true)
  const [positionOpen, setPositionOpen] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MagangFormValues>({
    resolver: zodResolver(magangSchema),
    defaultValues: {
      jenis_peserta: 'individu',
      anggota: [],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'anggota' })
  const jenisPeserta = watch('jenis_peserta')
  const startDate = watch('start_date')
  const endDate = watch('end_date')
  const selectedPositionId = watch('position_id')
  const selectedPosition = posisiList.find((p) => String(p.id) === selectedPositionId)

  useEffect(() => {
    getPosisiMagang()
      .then((data) => setPosisiList(data.filter((p) => p.status === 'active')))
      .catch(() => toast.error('Gagal memuat daftar posisi'))
      .finally(() => setLoadingPosisi(false))
  }, [])

  const onSubmit = async (values: MagangFormValues) => {
    const formData = new FormData()
    formData.append('type', 'magang')
    formData.append('position_id', values.position_id)
    formData.append('institution', values.institution)
    formData.append('study_program', values.study_program)
    formData.append('start_date', values.start_date)
    formData.append('end_date', values.end_date)
    formData.append('letter_number', values.letter_number)
    formData.append('phone_number', values.whatsapp)
    formData.append('member_1', `${values.nama_ketua}|${values.nim_ketua}|${values.email}`)

    if (values.jenis_peserta === 'kelompok') {
      values.anggota.forEach((a, i) => {
        formData.append(`member_${i + 2}`, `${a.nama}|${a.nim}`)
      })
    }

    formData.append('document', values.document[0])

    try {
      await submitPendaftaran(formData)
      toast.success('Pendaftaran berhasil dikirim!')
      onSuccess()
    } catch {
      toast.error('Gagal mengirim pendaftaran. Coba lagi.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>
          <BriefcaseBusiness size={18} className="text-primary" />
          Data Instansi
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className={fieldWrap}>
            <label className="text-sm font-semibold text-neutral-text">
              Sekolah / Universitas <span className="text-red-500">*</span>
            </label>
            <input {...register('institution')} placeholder="Nama sekolah atau universitas" className="input-field" />
            {errors.institution && <p className="text-xs text-red-500">{errors.institution.message}</p>}
          </div>

          <div className={fieldWrap}>
            <label className="text-sm font-semibold text-neutral-text">
              Program Studi <span className="text-red-500">*</span>
            </label>
            <input {...register('study_program')} placeholder="Program studi / jurusan" className="input-field" />
            {errors.study_program && <p className="text-xs text-red-500">{errors.study_program.message}</p>}
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>
          <CalendarDays size={18} className="text-primary" />
          Detail Kegiatan
        </h2>
        <input type="hidden" {...register('start_date')} />
        <input type="hidden" {...register('end_date')} />
        <input type="hidden" {...register('position_id')} />

        <div className="grid gap-4">
          <div className="relative flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-neutral-text">
              Posisi Magang <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              disabled={loadingPosisi}
              onClick={() => setPositionOpen((open) => !open)}
              className={`flex min-h-14 w-full items-center gap-3 rounded-xl border bg-white px-4 text-left transition hover:border-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:bg-neutral-soft disabled:text-neutral-muted ${
                errors.position_id ? 'border-red-300' : positionOpen ? 'border-primary ring-2 ring-primary/15' : 'border-neutral-border'
              }`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BriefcaseBusiness size={19} />
              </span>
              <span className={`min-w-0 flex-1 truncate text-sm font-bold ${selectedPosition ? 'text-neutral-text' : 'text-neutral-muted'}`}>
                {loadingPosisi ? 'Memuat posisi...' : selectedPosition?.position_name || 'Pilih posisi'}
              </span>
              <ChevronDown
                size={19}
                className={`shrink-0 text-primary transition-transform duration-200 ${positionOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {positionOpen && (
              <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-neutral-border bg-white shadow-lg">
                <div className="max-h-64 overflow-y-auto p-2">
                  {posisiList.length === 0 ? (
                    <div className="px-3 py-3 text-sm font-semibold text-neutral-muted">
                      Tidak ada posisi aktif
                    </div>
                  ) : (
                    posisiList.map((p) => {
                      const active = String(p.id) === selectedPositionId

                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setValue('position_id', String(p.id), { shouldDirty: true, shouldValidate: true })
                            setPositionOpen(false)
                          }}
                          className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-3 text-left text-sm font-semibold transition ${
                            active
                              ? 'bg-primary text-white'
                              : 'text-neutral-text hover:bg-neutral-soft hover:text-primary'
                          }`}
                        >
                          <span className="min-w-0 truncate">{p.position_name}</span>
                          {active && <Check size={16} className="shrink-0" />}
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            )}
            {errors.position_id && <p className="text-xs text-red-500">{errors.position_id.message}</p>}
          </div>

          <DateRangePickerField
            label="Periode Magang"
            startDate={startDate}
            endDate={endDate}
            startError={errors.start_date?.message}
            endError={errors.end_date?.message}
            onStartChange={(date) => setValue('start_date', date, { shouldDirty: true, shouldValidate: true })}
            onEndChange={(date) => setValue('end_date', date, { shouldDirty: true, shouldValidate: true })}
          />
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>
          <Users size={18} className="text-primary" />
          Data Peserta
        </h2>

        <div className="mb-4 flex flex-col gap-2">
          <label className="text-sm font-semibold text-neutral-text">
            Jenis Pendaftaran <span className="text-red-500">*</span>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            {(['individu', 'kelompok'] as const).map((val) => (
              <label
                key={val}
                className={`flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-all duration-200 ${
                  jenisPeserta === val
                    ? 'border-primary bg-primary text-white shadow-card'
                    : 'border-neutral-border bg-neutral-soft text-neutral-text hover:border-primary'
                }`}
              >
                <input type="radio" value={val} {...register('jenis_peserta')} className="hidden" />
                {val === 'individu' ? <User size={16} /> : <Users size={16} />}
                <span className="capitalize">{val}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className={fieldWrap}>
            <label className="text-sm font-semibold text-neutral-text">
              {jenisPeserta === 'kelompok' ? 'Nama Ketua' : 'Nama Lengkap'} <span className="text-red-500">*</span>
            </label>
            <input {...register('nama_ketua')} placeholder="Nama lengkap sesuai identitas" className="input-field" />
            {errors.nama_ketua && <p className="text-xs text-red-500">{errors.nama_ketua.message}</p>}
          </div>

          <div className={fieldWrap}>
            <label className="text-sm font-semibold text-neutral-text">
              {jenisPeserta === 'kelompok' ? 'NIM/NISN Ketua' : 'NIM/NISN'} <span className="text-red-500">*</span>
            </label>
            <input {...register('nim_ketua')} placeholder="NIM atau NISN" className="input-field" />
            {errors.nim_ketua && <p className="text-xs text-red-500">{errors.nim_ketua.message}</p>}
          </div>

          <div className={fieldWrap}>
            <label className="text-sm font-semibold text-neutral-text">
              Nomor WhatsApp <span className="text-red-500">*</span>
            </label>
            <input {...register('whatsapp')} placeholder="08xxxxxxxxxx" type="tel" className="input-field" />
            {errors.whatsapp && <p className="text-xs text-red-500">{errors.whatsapp.message}</p>}
          </div>

          <div className={fieldWrap}>
            <label className="text-sm font-semibold text-neutral-text">
              Email Aktif <span className="text-red-500">*</span>
            </label>
            <input {...register('email')} placeholder="nama@email.com" type="email" className="input-field" />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>
        </div>

        {jenisPeserta === 'kelompok' && (
          <div className="mt-5 flex flex-col gap-3">
            {fields.map((field, index) => (
              <div key={field.id} className="rounded-xl border border-neutral-border bg-neutral-soft p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-primary">Anggota {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={13} />
                    Hapus
                  </button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className={fieldWrap}>
                    <label className="text-xs font-semibold text-neutral-subtle">Nama Lengkap</label>
                    <input {...register(`anggota.${index}.nama`)} placeholder="Nama anggota" className="input-field text-sm" />
                    {errors.anggota?.[index]?.nama && (
                      <p className="text-xs text-red-500">{errors.anggota[index]?.nama?.message}</p>
                    )}
                  </div>
                  <div className={fieldWrap}>
                    <label className="text-xs font-semibold text-neutral-subtle">NIM/NISN</label>
                    <input {...register(`anggota.${index}.nim`)} placeholder="NIM atau NISN" className="input-field text-sm" />
                    {errors.anggota?.[index]?.nim && (
                      <p className="text-xs text-red-500">{errors.anggota[index]?.nim?.message}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {fields.length < 2 && (
              <button
                type="button"
                onClick={() => append({ nama: '', nim: '' })}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
              >
                <Plus size={16} />
                Tambah Anggota
              </button>
            )}
          </div>
        )}
      </section>

      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>
          <Upload size={18} className="text-primary" />
          Dokumen
        </h2>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div className={fieldWrap}>
            <label className="text-sm font-semibold text-neutral-text">
              Nomor Surat Permohonan <span className="text-red-500">*</span>
            </label>
            <input {...register('letter_number')} placeholder="Nomor surat permohonan" className="input-field" />
            {errors.letter_number && <p className="text-xs text-red-500">{errors.letter_number.message}</p>}
          </div>

          <div className={fieldWrap}>
            <label className="text-sm font-semibold text-neutral-text">
              Unggah Berkas (.zip) <span className="text-red-500">*</span>
            </label>
            <label
              className={`flex min-h-36 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-5 text-center transition-all duration-200 ${
                dragOver ? 'border-primary bg-primary/5' : 'border-neutral-border bg-neutral-soft hover:border-primary/60'
              }`}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                const files = e.dataTransfer.files
                if (files[0]) {
                  setValue('document', files as unknown as FileList)
                  setFileName(files[0].name)
                }
              }}
            >
              <Upload size={24} className="text-primary" />
              <span className="text-sm font-semibold text-neutral-text">
                {fileName || 'Klik atau drag file ZIP ke sini'}
              </span>
              <span className="text-xs text-neutral-muted">Format .zip, maksimal 10MB</span>
              <input
                type="file"
                accept=".zip"
                className="hidden"
                {...register('document', {
                  onChange: (e) => {
                    const file = e.target.files?.[0]
                    if (file) setFileName(file.name)
                  },
                })}
              />
            </label>
            {errors.document && <p className="text-xs text-red-500">{errors.document.message as string}</p>}
          </div>
        </div>
      </section>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-bold text-white shadow-lg transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Mengirim Pendaftaran...
          </>
        ) : (
          'Kirim Pendaftaran Magang'
        )}
      </button>
    </form>
  )
}

export default FormMagangSection
