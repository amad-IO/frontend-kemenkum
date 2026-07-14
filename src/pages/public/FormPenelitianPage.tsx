import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BookOpenText, CalendarDays, ChevronRight, Loader2, Plus, Trash2, Upload, User, Users } from 'lucide-react'
import { toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom'
import { submitPendaftaran } from '../../services/daftarService'
import HeroLayout from '../../components/public/layout/HeroLayout'
import Footer from '../../components/public/layout/Footer'
import ConfirmModal from '../../components/public/forms/ConfirmModal'
import DateRangePickerField from '../../components/public/forms/DateRangePickerField'
import daftarHeroImage from '../../assets/03.webp'
import { EDUCATION_LEVELS } from '../../data/indonesiaCities'
import RegencyCombobox from '../../components/public/forms/RegencyCombobox'
import EducationLevelSelect from '../../components/public/forms/EducationLevelSelect'
import SingleDatePickerField from '../../components/public/forms/SingleDatePickerField'

const anggotaSchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter'),
  nim: z.string().min(3, 'No. Identitas tidak valid'),
})

const phoneRegex = /^(08\d{8,11}|\+628\d{8,11})$/
const phoneErrorMessage = 'Gunakan format 08xxxxxxxxxx atau +628xxxxxxxxxx tanpa tanda -.'
const emialRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const emailErrorMessage = 'Email tidak valid'

const penelitianSchema = z
  .object({
    institution: z.string().min(3, 'Nama instansi tidak valid'),
    study_program: z.string().optional().default(''),
    education_level: z.enum(EDUCATION_LEVELS, { message: 'Pilih jenjang pendidikan' }),
    campus_city: z.string().min(1, 'Pilih lokasi kampus'),
    research_title: z.string().min(8, 'Judul penelitian minimal 8 karakter'),
    start_date: z.string().min(1, 'Tanggal mulai wajib dipilih'),
    end_date: z.string().min(1, 'Tanggal selesai wajib dipilih'),
    jenis_peserta: z.enum(['individu', 'kelompok']),
    nama_ketua: z.string().min(2, 'Nama minimal 2 karakter'),
    nim_ketua: z.string().min(3, 'No. Identitas tidak valid'),
    whatsapp: z.string().trim().refine((v) => phoneRegex.test(v), { message: phoneErrorMessage }),
    email: z.string().regex(emialRegex, {message: emailErrorMessage}),
    anggota: z.array(anggotaSchema).max(9),
    letter_number: z.string().min(3, 'Nomor surat tidak valid'),
    letter_date: z.string().min(1, 'Tanggal surat permohonan wajib dipilih'),
    document: z
      .instanceof(FileList)
      .refine((f) => f.length > 0, 'File wajib diupload')
      .refine((f) => f[0]?.name.toLowerCase().endsWith('.zip'), 'File harus format .zip'),
  })
  .superRefine((data, ctx) => {
    // Program studi wajib hanya untuk jenjang perkuliahan
    const isMahasiswa = !['SMA', 'SMK'].includes(data.education_level as string)
    if (isMahasiswa && (!data.study_program || data.study_program.trim().length < 2)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Program studi minimal 2 karakter',
        path: ['study_program'],
      })
    }
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai',
    path: ['end_date'],
  })

type PenelitianFormValues = z.infer<typeof penelitianSchema>
type SuccessAccount = { email: string; nim: string }
type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => void
}

const fieldWrap = 'flex flex-col gap-1.5'
const sectionClass = 'relative rounded-2xl border border-neutral-200/60 bg-white/80 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl sm:p-7 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-primary/20'
const sectionTitleClass = 'mb-5 flex items-center gap-2.5 text-lg font-extrabold text-neutral-text'

const FormPenelitianPage = () => {
  const navigate = useNavigate()
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [submitData, setSubmitData] = useState<FormData | null>(null)
  const [successAccount, setSuccessAccount] = useState<SuccessAccount | null>(null)
  const [isModalSubmitting, setIsModalSubmitting] = useState(false)
  const [isModalSuccess, setIsModalSuccess] = useState(false)

  const goToStatusPage = (account: SuccessAccount | null) => {
    const navigateToStatus = () => {
      navigate('/status', {
        state: {
          fromSuccess: true,
          email: account?.email,
          nim: account?.nim,
        },
      })
    }

    const transitionDocument = document as ViewTransitionDocument
    if (transitionDocument.startViewTransition) {
      transitionDocument.startViewTransition(navigateToStatus)
      return
    }

    navigateToStatus()
  }

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
  const startDate = watch('start_date')
  const endDate = watch('end_date')
  const campusCity = watch('campus_city')
  const educationLevel = watch('education_level')
  const letterDate = watch('letter_date')

  // Jika jenjang diganti ke SMA/SMK, kosongkan & disable field program studi
  const isSiswa = ['SMA', 'SMK'].includes(educationLevel as string)
  useEffect(() => {
    if (isSiswa) {
      setValue('study_program', '', { shouldValidate: false })
    }
  }, [isSiswa, setValue])

  function normalizePhone(raw: string) {
    if (!raw) return raw

    const num = raw.trim()

    if (!phoneRegex.test(num)) {
      throw new Error(phoneErrorMessage)
    }

    if (num.startsWith('08')) {
      return '+62' + num.slice(1)
    }

    return num
  }

  const onSubmit = (values: PenelitianFormValues) => {
    const formData = new FormData()
    formData.append('type', 'penelitian')
    formData.append('institution', values.institution)
    formData.append('study_program', values.study_program)
    formData.append('education_level', values.education_level)
    formData.append('campus_city', values.campus_city)
    formData.append('research_title', values.research_title)
    formData.append('start_date', values.start_date)
    formData.append('end_date', values.end_date)
    formData.append('letter_number', values.letter_number)
    formData.append('letter_date', values.letter_date)
    formData.append('phone_number', normalizePhone(values.whatsapp))
    formData.append('member_1', `${values.nama_ketua}|${values.nim_ketua}|${values.email}`)

    if (values.jenis_peserta === 'kelompok') {
      values.anggota.forEach((a, i) => {
        formData.append(`member_${i + 2}`, `${a.nama}|${a.nim}`)
      })
    }

    formData.append('document', values.document[0])

    setSubmitData(formData)
    setSuccessAccount({ email: values.email, nim: values.nim_ketua })
    setIsModalSuccess(false)
    setIsConfirmOpen(true)
  }

  const handleConfirmSubmit = async () => {
    if (!submitData) return
    setIsModalSubmitting(true)
    setIsModalSuccess(false)
    try {
      await submitPendaftaran(submitData)
      setIsModalSubmitting(false)
      setIsModalSuccess(true)
    } catch (error: any) {
      setIsConfirmOpen(false)
      setIsModalSuccess(false)
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Gagal mengirim pendaftaran. Coba lagi.')
      }
      setIsModalSubmitting(false)
    }
  }

  const onError = () => {
    toast.error('Mohon periksa kembali, ada isian yang belum lengkap atau tidak valid.')
  }

  return (
    <HeroLayout
      image={daftarHeroImage}
      title="Pendaftaran Program"
      subtitle="Pilih jenis program, baca persyaratan, lalu isi form pendaftaran."
      badge="Requirement & Registration"
    >
      <main className="bg-neutral-card">
        <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="mb-6 flex items-center gap-1.5 text-xs text-neutral-muted" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight size={13} />
            <Link to="/daftar" className="hover:text-primary transition-colors">Registration</Link>
            <ChevronRight size={13} />
            <span className="font-semibold text-primary">Form Penelitian</span>
          </nav>

          <form onSubmit={handleSubmit(onSubmit, onError)} className="flex flex-col gap-5">
            <section className={`${sectionClass} z-20`}>
              <h2 className={sectionTitleClass}>
                <BookOpenText size={18} className="text-primary" />
                Data Penelitian
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
                    Lokasi Kampus / Sekolah <span className="text-red-500">*</span>
                  </label>
                  <input type="hidden" {...register('campus_city')} />
                  <RegencyCombobox
                    value={campusCity}
                    hasError={Boolean(errors.campus_city)}
                    onChange={(value) => setValue('campus_city', value, { shouldDirty: true, shouldValidate: true })}
                  />
                  {errors.campus_city && <p className="text-xs text-red-500">{errors.campus_city.message}</p>}
                </div>

                <div className={fieldWrap}>
                  <label className="text-sm font-semibold text-neutral-text">
                    Jenjang Pendidikan <span className="text-red-500">*</span>
                  </label>
                  <input type="hidden" {...register('education_level')} />
                  <EducationLevelSelect
                    value={educationLevel}
                    hasError={Boolean(errors.education_level)}
                    onChange={(value) => setValue('education_level', value, { shouldDirty: true, shouldValidate: true })}
                  />
                  {errors.education_level && <p className="text-xs text-red-500">{errors.education_level.message}</p>}
                </div>

                <div className={fieldWrap}>
                  <label className="text-sm font-semibold text-neutral-text">
                    Program Studi
                    {!isSiswa && <span className="text-red-500"> *</span>}
                  </label>
                  <input
                    {...register('study_program')}
                    disabled={isSiswa}
                    placeholder={isSiswa ? 'Tidak berlaku untuk SMA / SMK' : 'Program studi / jurusan'}
                    className={`input-field transition-colors ${isSiswa ? 'cursor-not-allowed bg-neutral-100 text-neutral-400 placeholder:text-neutral-400' : ''}`}
                  />
                  {isSiswa && (
                    <p className="text-xs text-neutral-400">Untuk SMA/SMK, nama sekolah digunakan pada surat</p>
                  )}
                  {errors.study_program && !isSiswa && <p className="text-xs text-red-500">{errors.study_program.message}</p>}
                </div>

                <div className={`${fieldWrap} md:col-span-2`}>
                  <label className="text-sm font-semibold text-neutral-text">
                    Judul Penelitian Yang Diajukan <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('research_title')}
                    placeholder="Contoh: Analisis pelayanan hukum digital pada masyarakat"
                    className="input-field"
                  />
                  {errors.research_title && <p className="text-xs text-red-500">{errors.research_title.message}</p>}
                </div>
              </div>
            </section>

            <section className={`${sectionClass} relative z-10`}>
              <h2 className={sectionTitleClass}>
                <CalendarDays size={18} className="text-primary" />
                Periode Penelitian
              </h2>
              <input type="hidden" {...register('start_date')} />
              <input type="hidden" {...register('end_date')} />

              <DateRangePickerField
                label="Periode Penelitian"
                startDate={startDate}
                endDate={endDate}
                startError={errors.start_date?.message}
                endError={errors.end_date?.message}
                onStartChange={(date) => setValue('start_date', date, { shouldDirty: true, shouldValidate: true })}
                onEndChange={(date) => setValue('end_date', date, { shouldDirty: true, shouldValidate: true })}
              />
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
                      className={`group flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-4 text-sm font-bold transition-all duration-300 ${
                        jenisPeserta === val
                          ? 'border-primary bg-primary text-white shadow-lg shadow-primary/30 scale-[1.02]'
                          : 'border-neutral-200 bg-white text-neutral-600 hover:border-primary/50 hover:bg-primary/5'
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
                    {jenisPeserta === 'kelompok' ? 'No. Identitas Ketua' : 'No. Identitas'} <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-neutral-400 mt-[-2px] mb-1">(Bisa diisi NIM, NISN, NIP, NIK, dll)</p>
                  <input {...register('nim_ketua')} placeholder="NIM atau NISN" className="input-field" />
                  {errors.nim_ketua && <p className="text-xs text-red-500">{errors.nim_ketua.message}</p>}
                </div>

                <div className={fieldWrap}>
                  <label className="text-sm font-semibold text-neutral-text">
                    Nomor WhatsApp <span className="text-xs text-red-500">(08 atau +62)*</span>
                  </label>
                  <input {...register('whatsapp')} placeholder="08xxxxxxxxxx / +628xxxxxxxxxx" type="tel" inputMode="tel" className="input-field" />
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
                        <div className="flex-1 space-y-1">
                          <label className="text-xs font-semibold text-neutral-subtle">No. Identitas</label>
                          <p className="text-[10px] text-neutral-400 leading-tight">(NIM, NISN, NIP, NIK)</p>
                          <input {...register(`anggota.${index}.nim`)} placeholder="NIM atau NISN" className="input-field text-sm" />
                          {errors.anggota?.[index]?.nim && (
                            <p className="text-xs text-red-500">{errors.anggota[index]?.nim?.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {fields.length < 9 && (
                    <button
                      type="button"
                      onClick={() => append({ nama: '', nim: '' })}
                      className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 text-sm font-bold text-primary transition-all duration-300 hover:border-primary hover:bg-primary/10 hover:shadow-inner"
                    >
                      <Plus size={16} className="transition-transform group-hover:rotate-90" />
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
                    Tanggal Surat Permohonan <span className="text-red-500">*</span>
                  </label>
                  <input type="hidden" {...register('letter_date')} />
                  <SingleDatePickerField
                    value={letterDate}
                    hasError={Boolean(errors.letter_date)}
                    onChange={(value) => setValue('letter_date', value, { shouldDirty: true, shouldValidate: true })}
                  />
                  {errors.letter_date && <p className="text-xs text-red-500">{errors.letter_date.message}</p>}
                </div>

                <div className={`${fieldWrap} lg:col-span-2`}>
                  <label className="text-sm font-semibold text-neutral-text">
                    Unggah Berkas (.zip) <span className="text-red-500">*</span>
                  </label>
                  <label
                    className={`group flex min-h-36 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-300 ${
                      dragOver ? 'border-primary bg-primary/10 scale-[1.02] shadow-inner' : 'border-neutral-300 bg-neutral-50 hover:border-primary hover:bg-primary/5'
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
                    <Upload size={28} className="text-primary transition-transform duration-300 group-hover:-translate-y-1" />
                    <span className="text-sm font-bold text-neutral-text">
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
              className="group relative overflow-hidden flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary-dark px-6 text-base font-bold text-white shadow-[0_8px_20px_rgb(0,0,0,0.15)] shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_25px_rgb(0,0,0,0.2)] hover:shadow-primary/40 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
                <div className="relative h-full w-8 bg-white/20" />
              </div>
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Memproses...
                </>
              ) : (
                'Kirim Pendaftaran Penelitian'
              )}
            </button>

            <ConfirmModal
              isOpen={isConfirmOpen}
              isSubmitting={isModalSubmitting}
              isSuccess={isModalSuccess}
              accountEmail={successAccount?.email}
              accountNim={successAccount?.nim}
              onClose={() => {
                const shouldGoToStatus = isModalSuccess
                const account = successAccount
                setIsConfirmOpen(false)
                setIsModalSuccess(false)
                setSuccessAccount(null)
                if (shouldGoToStatus) {
                  goToStatusPage(account)
                }
              }}
              onConfirm={handleConfirmSubmit}
            />
          </form>
        </div>
      </main>
      <Footer />
    </HeroLayout>
  )
}

export default FormPenelitianPage
