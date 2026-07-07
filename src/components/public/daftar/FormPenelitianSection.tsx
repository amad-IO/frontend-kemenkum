import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Calendar, Upload, Plus, Trash2, Loader2, Users, User } from 'lucide-react'
import { toast } from 'react-toastify'
import {
  getJudulPenelitian,
  getPeriode,
  submitPendaftaran,
  type JudulPenelitian,
} from '../../../services/daftarService'

// ─── Zod Validation Schema ────────────────────────────────────────────────────

const anggotaSchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter'),
  nim: z.string().min(3, 'NIM/NISN tidak valid'),
})

const penelitianSchema = z.object({
  institution: z.string().min(3, 'Nama instansi tidak valid'),
  study_program: z.string().min(2, 'Program studi tidak valid'),
  judul_penelitian_id: z.string().min(1, 'Pilih judul penelitian terlebih dahulu'),
  jenis_peserta: z.enum(['individu', 'kelompok']),
  nama_ketua: z.string().min(2, 'Nama minimal 2 karakter'),
  nim_ketua: z.string().min(3, 'NIM/NISN tidak valid'),
  whatsapp: z.string().min(9, 'Nomor WhatsApp tidak valid'),
  email: z.string().email('Email tidak valid'),
  // Anggota kelompok — dinamis tanpa batas
  anggota: z.array(anggotaSchema),
  letter_number: z.string().min(3, 'Nomor surat tidak valid'),
  document: z
    .instanceof(FileList)
    .refine((f) => f.length > 0, 'File wajib diupload')
    .refine((f) => f[0]?.name.endsWith('.zip'), 'File harus format .zip'),
})

type PenelitianFormValues = z.infer<typeof penelitianSchema>

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  onSuccess: () => void
}

const FormPenelitianSection = ({ onSuccess }: Props) => {
  const judulList: JudulPenelitian[] = getJudulPenelitian()
  const periode = getPeriode('penelitian')
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PenelitianFormValues>({
    resolver: zodResolver(penelitianSchema),
    defaultValues: {
      jenis_peserta: 'individu',
      anggota: [],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'anggota' })
  const jenisPeserta = watch('jenis_peserta')

  const onSubmit = async (values: PenelitianFormValues) => {
    const formData = new FormData()
    formData.append('type', 'penelitian')
    formData.append('institution', values.institution)
    formData.append('study_program', values.study_program)
    formData.append('start_date', periode.mulai)
    formData.append('end_date', periode.selesai)
    formData.append('letter_number', values.letter_number)
    formData.append('phone_number', values.whatsapp)

    // Judul penelitian sebagai position_id (mapping sementara)
    formData.append('position_id', values.judul_penelitian_id)

    // member_1 = Ketua/Individu
    formData.append('member_1', `${values.nama_ketua}|${values.nim_ketua}|${values.email}`)

    // Anggota kelompok — dinamis, max yang bisa disimpan backend member_2 & member_3
    if (values.jenis_peserta === 'kelompok') {
      values.anggota.forEach((a, i) => {
        if (i < 2) {
          formData.append(`member_${i + 2}`, `${a.nama}|${a.nim}`)
        }
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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

      {/* ── Row: Instansi & Program Studi ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-neutral-text">
            Sekolah / Universitas <span className="text-red-500">*</span>
          </label>
          <input
            {...register('institution')}
            placeholder="Input Nama lengkap / Universitas"
            className="input-field"
          />
          {errors.institution && (
            <p className="text-xs text-red-500">{errors.institution.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-neutral-text">
            Program Studi <span className="text-red-500">*</span>
          </label>
          <input
            {...register('study_program')}
            placeholder="Input Program studi"
            className="input-field"
          />
          {errors.study_program && (
            <p className="text-xs text-red-500">{errors.study_program.message}</p>
          )}
        </div>
      </div>

      {/* ── Row: Judul Penelitian & Periode ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-neutral-text">
            Judul Penelitian <span className="text-red-500">*</span>
          </label>
          <select {...register('judul_penelitian_id')} className="input-field">
            <option value="">Input Judul Penelitian</option>
            {judulList.map((j) => (
              <option key={j.id} value={j.id}>
                {j.judul}
              </option>
            ))}
          </select>
          {errors.judul_penelitian_id && (
            <p className="text-xs text-red-500">{errors.judul_penelitian_id.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-neutral-text">
            Periode Kegiatan
          </label>
          <div className="input-field flex items-center gap-2 bg-neutral-soft text-neutral-muted cursor-not-allowed">
            <Calendar size={16} className="shrink-0 text-primary/60" />
            <span className="text-sm">{periode.label}</span>
          </div>
        </div>
      </div>

      {/* ── Jenis Peserta ── */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-neutral-text">
          Jenis Pendaftaran <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3">
          {(['individu', 'kelompok'] as const).map((val) => (
            <label
              key={val}
              className={`flex cursor-pointer items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                jenisPeserta === val
                  ? 'border-primary bg-primary text-white shadow-card'
                  : 'border-neutral-border bg-neutral-soft text-neutral-text hover:border-primary'
              }`}
            >
              <input
                type="radio"
                value={val}
                {...register('jenis_peserta')}
                className="hidden"
              />
              {val === 'individu' ? <User size={15} /> : <Users size={15} />}
              <span className="capitalize">{val}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ── Fields Ketua / Individu ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-neutral-text">
            {jenisPeserta === 'kelompok' ? 'Nama Lengkap – Ketua' : 'Nama Lengkap'}{' '}
            <span className="text-red-500">*</span>
          </label>
          <input
            {...register('nama_ketua')}
            placeholder="Input Nama lengkap sesuai KTP"
            className="input-field"
          />
          {errors.nama_ketua && (
            <p className="text-xs text-red-500">{errors.nama_ketua.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-neutral-text">
            {jenisPeserta === 'kelompok' ? 'NIM/NISN – Ketua' : 'NIM/NISN'}{' '}
            <span className="text-red-500">*</span>
          </label>
          <input
            {...register('nim_ketua')}
            placeholder="Input Nim Dari Universitas"
            className="input-field"
          />
          {errors.nim_ketua && (
            <p className="text-xs text-red-500">{errors.nim_ketua.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-neutral-text">
            {jenisPeserta === 'kelompok' ? 'Nomor WhatsApp – Ketua' : 'Nomor WhatsApp'}{' '}
            <span className="text-red-500">*</span>
          </label>
          <input
            {...register('whatsapp')}
            placeholder="Input Nomor Whatsapp"
            type="tel"
            className="input-field"
          />
          {errors.whatsapp && (
            <p className="text-xs text-red-500">{errors.whatsapp.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-neutral-text">
            {jenisPeserta === 'kelompok' ? 'Email Aktif – Ketua' : 'Email Aktif'}{' '}
            <span className="text-red-500">*</span>
          </label>
          <input
            {...register('email')}
            placeholder="Input Email Aktif"
            type="email"
            className="input-field"
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>
      </div>

      {/* ── Anggota Kelompok Dinamis (tidak ada batas) ── */}
      {jenisPeserta === 'kelompok' && (
        <div className="flex flex-col gap-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-xl border border-neutral-border bg-neutral-bg p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold text-primary">
                  Anggota {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={13} />
                  Hapus
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-subtle">
                    Nama Lengkap – Anggota {index + 1}
                  </label>
                  <input
                    {...register(`anggota.${index}.nama`)}
                    placeholder="Input Nama lengkap sesuai KTP"
                    className="input-field text-sm"
                  />
                  {errors.anggota?.[index]?.nama && (
                    <p className="text-xs text-red-500">
                      {errors.anggota[index]?.nama?.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-subtle">
                    NIM/NISN – Anggota {index + 1}
                  </label>
                  <input
                    {...register(`anggota.${index}.nim`)}
                    placeholder="Input Nim Dari Universitas"
                    className="input-field text-sm"
                  />
                  {errors.anggota?.[index]?.nim && (
                    <p className="text-xs text-red-500">
                      {errors.anggota[index]?.nim?.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Tombol + Anggota — tidak ada batas */}
          <button
            type="button"
            onClick={() => append({ nama: '', nim: '' })}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 py-3 text-sm font-semibold text-primary transition-all duration-200 hover:border-primary hover:bg-primary/5"
          >
            <Plus size={16} />
            + Anggota {fields.length + 1}
          </button>
        </div>
      )}

      {/* ── Nomor Surat ── */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-neutral-text">
          Nomor Surat Permohonan <span className="text-red-500">*</span>
        </label>
        <input
          {...register('letter_number')}
          placeholder="Input Nomor Surat Permohonan"
          className="input-field"
        />
        {errors.letter_number && (
          <p className="text-xs text-red-500">{errors.letter_number.message}</p>
        )}
      </div>

      {/* ── Upload Berkas ── */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-neutral-text">
          Unggah Berkas (.zip) <span className="text-red-500">*</span>
        </label>
        <label
          className={`flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-8 transition-all duration-200 ${
            dragOver
              ? 'border-primary bg-primary/5'
              : 'border-neutral-border bg-neutral-soft hover:border-primary/50 hover:bg-primary/5'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
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
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Upload size={22} className="text-primary" />
          </div>
          <div className="text-center">
            {fileName ? (
              <p className="text-sm font-semibold text-primary">{fileName}</p>
            ) : (
              <>
                <p className="text-sm font-semibold text-neutral-text">
                  Drag & drop atau klik untuk upload
                </p>
                <p className="mt-1 text-xs text-neutral-muted">Format: .zip | Maks. 10MB</p>
              </>
            )}
          </div>
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
          <span className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white shadow-card transition hover:bg-primary-dark">
            Upload File
          </span>
        </label>
        {errors.document && (
          <p className="text-xs text-red-500">{errors.document.message as string}</p>
        )}
      </div>

      {/* ── Submit ── */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Mengirim Pendaftaran...
          </>
        ) : (
          'Kirim Pendaftaran Penelitian'
        )}
      </button>
    </form>
  )
}

export default FormPenelitianSection
