import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BriefcaseBusiness, CalendarDays, Check, ChevronDown, ChevronRight, Loader2, Plus, Trash2, Upload, User, Users } from 'lucide-react'
import { toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom'
import {
  getPeriodeMagang,
  submitPendaftaran,
  type Periode,
} from '../../services/daftarService'
import HeroLayout from '../../components/public/layout/HeroLayout'
import Footer from '../../components/public/layout/Footer'
import ConfirmModal from '../../components/public/forms/ConfirmModal'
import daftarHeroImage from '../../assets/03.webp'
import { EDUCATION_LEVELS } from '../../data/indonesiaCities'
import RegencyCombobox from '../../components/public/forms/RegencyCombobox'
import EducationLevelSelect from '../../components/public/forms/EducationLevelSelect'
import SingleDatePickerField from '../../components/public/forms/SingleDatePickerField'

const anggotaSchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter'),
  nim: z.string().min(3, 'NIM/NISN tidak valid'),
})

const phoneRegex = /^(08\d{8,11}|\+628\d{8,11})$/
const phoneErrorMessage = 'Gunakan format 08xxxxxxxxxx atau +628xxxxxxxxxx tanpa tanda -.'
const emialRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const emailErrorMessage = 'Email tidak valid'

const magangSchema = z
  .object({
    institution: z.string().min(3, 'Nama instansi tidak valid'),
    study_program: z.string().min(2, 'Program studi tidak valid'),
    education_level: z.enum(EDUCATION_LEVELS, { message: 'Pilih jenjang pendidikan' }),
    campus_city: z.string().min(1, 'Pilih lokasi kampus'),
    period_id: z.string().min(1, 'Pilih periode terlebih dahulu'),
    jenis_peserta: z.enum(['individu', 'kelompok']),
    nama_ketua: z.string().min(2, 'Nama minimal 2 karakter'),
    nim_ketua: z.string().min(3, 'NIM/NISN tidak valid'),
    whatsapp: z.string().trim().refine((v) => phoneRegex.test(v), { message: phoneErrorMessage }),
    email: z.string().regex(emialRegex, {message: emailErrorMessage}),
    anggota: z.array(anggotaSchema).max(2),
    letter_number: z.string().min(3, 'Nomor surat tidak valid'),
    letter_date: z.string().min(1, 'Tanggal surat permohonan wajib dipilih'),
    document: z
      .instanceof(FileList)
      .refine((f) => f.length > 0, 'File wajib diupload')
      .refine((f) => f[0]?.name.toLowerCase().endsWith('.zip'), 'File harus format .zip'),
  })

type MagangFormValues = z.infer<typeof magangSchema>
type SuccessAccount = { email: string; nim: string }
type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => void
}

const fieldWrap = 'flex flex-col gap-1.5'
const sectionClass = 'relative rounded-2xl border border-neutral-200/60 bg-white/80 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl sm:p-7 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-primary/20'
const sectionTitleClass = 'mb-5 flex items-center gap-2.5 text-lg font-extrabold text-neutral-text'

const FormMagangPage = () => {
  const navigate = useNavigate()
  const [periodeList, setPeriodeList] = useState<Periode[]>([])
  const [loadingPeriode, setLoadingPeriode] = useState(true)
  const [periodOpen, setPeriodOpen] = useState(false)
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
  } = useForm<MagangFormValues>({
    resolver: zodResolver(magangSchema),
    defaultValues: {
      jenis_peserta: 'individu',
      anggota: [],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'anggota' })
  const jenisPeserta = watch('jenis_peserta')
  const selectedPeriodId = watch('period_id')
  const selectedPeriod = periodeList.find((p) => String(p.id) === selectedPeriodId)
  const campusCity = watch('campus_city')
  const educationLevel = watch('education_level')
  const letterDate = watch('letter_date')

  useEffect(() => {
    getPeriodeMagang()
      .then((data) => setPeriodeList(data))
      .catch(() => toast.error('Gagal memuat daftar periode'))
      .finally(() => setLoadingPeriode(false))
  }, [])

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })

  function normalizePhone(raw: string) {
    if (!raw) return raw

    let num = raw.trim()

    if (!phoneRegex.test(num)) {
      throw new Error(phoneErrorMessage)
    }

    if (num.startsWith('08')) {
      num = '+62' + num.slice(1)
    }

    return num
  }

  const onSubmit = (values: MagangFormValues) => {
    if (!selectedPeriod) {
      toast.error('Periode magang tidak valid')
      return
    }

    const formData = new FormData()
    formData.append('type', 'magang')
    formData.append('period_id', values.period_id)
    formData.append('institution', values.institution)
    formData.append('study_program', values.study_program)
    formData.append('education_level', values.education_level)
    formData.append('campus_city', values.campus_city)
    formData.append('start_date', selectedPeriod.start_date)
    formData.append('end_date', selectedPeriod.end_date)
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
      title="Pendaftaran Program Magang"
      subtitle="Isi formulir pendaftaran magang dan lengkapi berkas persyaratannya."
      badge="Requirement & Registration"
    >
      <main className="bg-neutral-card">
        <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="mb-6 flex items-center gap-1.5 text-xs text-neutral-muted" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight size={13} />
            <Link to="/daftar" className="hover:text-primary transition-colors">Registration</Link>
            <ChevronRight size={13} />
            <span className="font-semibold text-primary">Form Magang</span>
          </nav>

          <form onSubmit={handleSubmit(onSubmit, onError)} className="flex flex-col gap-5">
            <section className={`${sectionClass} z-20`}>
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
                    Program Studi <span className="text-red-500">*</span>
                  </label>
                  <input {...register('study_program')} placeholder="Program studi / jurusan" className="input-field" />
                  {errors.study_program && <p className="text-xs text-red-500">{errors.study_program.message}</p>}
                </div>
              </div>
            </section>

            <section className={`${sectionClass} relative z-10`}>
              <h2 className={sectionTitleClass}>
                <CalendarDays size={18} className="text-primary" />
                Periode Magang
              </h2>
              <input type="hidden" {...register('period_id')} />

              <div className="relative flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-neutral-text">
                  Pilih Periode <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  disabled={loadingPeriode}
                  onClick={() => setPeriodOpen((open) => !open)}
                  className={`group flex min-h-14 w-full items-center gap-3 rounded-xl border-2 bg-white px-4 text-left transition-all duration-300 hover:border-primary hover:bg-primary/5 hover:shadow-md disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-muted ${
                    errors.period_id ? 'border-red-300' : periodOpen ? 'border-primary ring-4 ring-primary/20 shadow-sm' : 'border-neutral-200'
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                    <CalendarDays size={19} />
                  </span>
                  <span className={`min-w-0 flex-1 truncate text-sm font-bold ${selectedPeriod ? 'text-neutral-text' : 'text-neutral-muted'}`}>
                    {loadingPeriode 
                      ? 'Memuat periode...' 
                      : selectedPeriod 
                        ? `${formatDate(selectedPeriod.start_date)} - ${formatDate(selectedPeriod.end_date)} (Sisa Kuota: ${selectedPeriod.remaining_quota})`
                        : 'Pilih periode magang'
                    }
                  </span>
                  <ChevronDown
                    size={19}
                    className={`shrink-0 text-primary transition-transform duration-200 ${periodOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {periodOpen && (
                  <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-xl transition-all">
                    <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
                      {periodeList.length === 0 ? (
                        <div className="px-3 py-3 text-sm font-semibold text-neutral-muted">
                          Tidak ada periode aktif
                        </div>
                      ) : (
                        periodeList.map((p) => {
                          const active = String(p.id) === selectedPeriodId
                          const isFull = p.remaining_quota <= 0
                          
                          return (
                            <button
                              key={p.id}
                              type="button"
                              disabled={isFull}
                              onClick={() => {
                                if (!isFull) {
                                  setValue('period_id', String(p.id), { shouldDirty: true, shouldValidate: true })
                                  setPeriodOpen(false)
                                }
                              }}
                              className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors ${
                                isFull
                                  ? 'opacity-50 cursor-not-allowed bg-neutral-50 text-neutral-muted'
                                  : active
                                    ? 'bg-primary text-white shadow-md'
                                    : 'text-neutral-text hover:bg-primary/10 hover:text-primary'
                              }`}
                            >
                              <span className="min-w-0 truncate">
                                {formatDate(p.start_date)} - {formatDate(p.end_date)} 
                                <span className={`ml-2 text-xs ${active ? 'text-white/80' : 'text-neutral-muted'}`}>
                                  (Sisa Kuota: {p.remaining_quota})
                                </span>
                              </span>
                              {active && <Check size={16} className="shrink-0" />}
                            </button>
                          )
                        })
                      )}
                    </div>
                  </div>
                )}
                {errors.period_id && <p className="text-xs text-red-500">{errors.period_id.message}</p>}
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
                    {jenisPeserta === 'kelompok' ? 'NIM/NISN Ketua' : 'NIM/NISN'} <span className="text-red-500">*</span>
                  </label>
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
                'Kirim Pendaftaran Magang'
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

export default FormMagangPage
