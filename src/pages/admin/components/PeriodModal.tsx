import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CalendarDays, ChevronLeft, ChevronRight, X, Loader2, Save } from 'lucide-react'

const schema = z.object({
  start_date: z.string().min(1, 'Tanggal mulai wajib diisi'),
  end_date: z.string().min(1, 'Tanggal selesai wajib diisi'),
  quota: z.number().min(1, 'Kuota minimal 1'),
  status: z.enum(['active', 'inactive']),
}).refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
  message: 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai',
  path: ['end_date'],
})

export type PeriodFormValues = z.infer<typeof schema>

interface Props {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: PeriodFormValues) => void
  initialData?: PeriodFormValues & { id?: number }
  isSubmitting: boolean
}

const toISODate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const parseDate = (value?: string) => {
  if (!value) return new Date()
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const addDays = (date: Date, amount: number) => {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

const addMonths = (date: Date, amount: number) => {
  const next = new Date(date)
  next.setMonth(next.getMonth() + amount)
  return next
}

const formatDate = (value?: string) => {
  if (!value) return ''
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(parseDate(value))
}

const monthLabel = (date: Date) =>
  new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(date)

const isSameDate = (date: Date, value?: string) => value ? toISODate(date) === value : false

const formatDuration = (start?: string, end?: string) => {
  if (!start || !end || end < start) return 'Pilih tanggal akhir'
  const startTime = parseDate(start).getTime()
  const endTime = parseDate(end).getTime()
  const totalDays = Math.floor((endTime - startTime) / 86400000) + 1
  const weeks = Math.floor(totalDays / 7)
  const days = totalDays % 7
  if (weeks === 0) return `${days} hari`
  if (days === 0) return `${weeks} minggu`
  return `${weeks} minggu + ${days} hari`
}

const PeriodModal = ({ isOpen, onClose, onSubmit, initialData, isSubmitting }: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PeriodFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      start_date: '',
      end_date: '',
      quota: 10,
      status: 'active',
    },
  })

  const [step, setStep] = useState<'start' | 'end'>('start')
  const startDate = watch('start_date')
  const endDate = watch('end_date')
  const [viewDate, setViewDate] = useState(parseDate(startDate || endDate))

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset(initialData)
        setViewDate(parseDate(initialData.start_date))
      } else {
        reset({ start_date: '', end_date: '', quota: 10, status: 'active' })
        setViewDate(new Date())
      }
      setStep('start')
    }
  }, [isOpen, initialData, reset])

  const monthDates = useMemo(() => {
    const firstDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
    const mondayOffset = (firstDate.getDay() + 6) % 7
    const start = addDays(firstDate, -mondayOffset)
    return Array.from({ length: 42 }, (_, index) => addDays(start, index))
  }, [viewDate])

  const chooseDate = (date: Date) => {
    const value = toISODate(date)
    if (step === 'start') {
      setValue('start_date', value, { shouldValidate: true, shouldDirty: true })
      if (endDate && endDate < value) setValue('end_date', '', { shouldValidate: true, shouldDirty: true })
      setStep('end')
      return
    }
    if (startDate && value < startDate) {
      setValue('start_date', value, { shouldValidate: true, shouldDirty: true })
      setValue('end_date', '', { shouldValidate: true, shouldDirty: true })
      return
    }
    setValue('end_date', value, { shouldValidate: true, shouldDirty: true })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="fixed inset-0 bg-neutral-text/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-border px-5 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-neutral-border bg-neutral-soft text-primary">
                <CalendarDays size={20} />
              </span>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-neutral-text">
                  {initialData ? 'Edit Periode Kegiatan' : 'Pilih Periode Kegiatan'}
                </h3>
                <p className="mt-0.5 text-sm text-neutral-subtle">
                  Tentukan tanggal mulai, tanggal selesai, kuota, dan status.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-muted transition hover:bg-neutral-soft hover:text-neutral-text"
              aria-label="Tutup form"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid md:grid-cols-[1.12fr_0.88fr]">
            {/* Left: Calendar */}
            <div className="p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setViewDate(addMonths(viewDate, -1))}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-muted transition hover:bg-neutral-soft hover:text-primary"
                  aria-label="Bulan sebelumnya"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-base font-bold text-neutral-text">{monthLabel(viewDate)}</span>
                <button
                  type="button"
                  onClick={() => setViewDate(addMonths(viewDate, 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-muted transition hover:bg-neutral-soft hover:text-primary"
                  aria-label="Bulan berikutnya"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-y-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <span key={day} className="py-1 text-center text-xs font-bold text-neutral-muted">{day}</span>
                ))}
                {monthDates.map((date) => {
                  const value = toISODate(date)
                  const outOfMonth = date.getMonth() !== viewDate.getMonth()
                  const beforeStart = step === 'end' && startDate && value < startDate
                  const disabled = outOfMonth || Boolean(beforeStart)
                  
                  // Highlight logic
                  const active = isSameDate(date, step === 'start' ? startDate : endDate)
                  const rangeEdge = isSameDate(date, startDate) || isSameDate(date, endDate)
                  const inRange = startDate && endDate && value > startDate && value < endDate
                  
                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={disabled}
                      onClick={() => chooseDate(date)}
                      className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition ${
                        active || rangeEdge
                          ? 'bg-primary text-white shadow-card'
                          : inRange
                            ? 'bg-secondary-light text-primary'
                            : 'text-neutral-text hover:bg-neutral-soft'
                      } disabled:cursor-not-allowed disabled:text-neutral-muted/45 disabled:hover:bg-transparent`}
                    >
                      {date.getDate()}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Right: Form Fields */}
            <div className="border-t border-neutral-border p-5 md:border-l md:border-t-0">
              <div className="flex flex-col gap-5">
                <div>
                  <label className="mb-2 block text-sm font-bold text-neutral-text">Start date*</label>
                  <button
                    type="button"
                    onClick={() => setStep('start')}
                    className={`flex min-h-12 w-full items-center rounded-xl border bg-white text-left text-sm transition ${
                      step === 'start' ? 'border-primary ring-2 ring-primary/15' : 'border-neutral-border'
                    }`}
                  >
                    <span className="flex-1 px-4 font-semibold text-neutral-text">
                      {startDate ? formatDate(startDate) : 'Pilih tanggal awal'}
                    </span>
                  </button>
                  {errors.start_date && <p className="mt-1 text-xs text-red-500">{errors.start_date.message}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-neutral-text">End date*</label>
                  <button
                    type="button"
                    onClick={() => startDate && setStep('end')}
                    disabled={!startDate}
                    className={`flex min-h-12 w-full items-center rounded-xl border bg-white text-left text-sm transition ${
                      step === 'end' ? 'border-primary ring-2 ring-primary/15' : 'border-neutral-border'
                    } disabled:cursor-not-allowed disabled:bg-neutral-soft disabled:text-neutral-muted`}
                  >
                    <span className="flex-1 px-4 font-semibold text-neutral-text">
                      {endDate ? formatDate(endDate) : 'Pilih tanggal berakhir'}
                    </span>
                  </button>
                  {errors.end_date && <p className="mt-1 text-xs text-red-500">{errors.end_date.message}</p>}
                </div>

                <div className="flex items-center justify-between gap-3 rounded-xl border border-neutral-border bg-neutral-soft px-4 py-3">
                  <span className="text-sm font-semibold text-neutral-text">Total durasi</span>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary">
                    {formatDuration(startDate, endDate)}
                  </span>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-neutral-text">Total Kuota (Jumlah Orang)*</label>
                  <input
                    type="number"
                    min="1"
                    {...register('quota', { valueAsNumber: true })}
                    className="min-h-12 w-full rounded-xl border border-neutral-border bg-white px-4 text-sm font-semibold text-neutral-text transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                  />
                  {errors.quota && <p className="mt-1 text-xs text-red-500">{errors.quota.message}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-neutral-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-neutral-muted">
              Periode:{' '}
              <span className="font-bold text-neutral-text">
                {startDate ? formatDate(startDate) : '-'}
                {endDate ? ` - ${formatDate(endDate)}` : ''}
              </span>
            </p>
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="min-h-11 rounded-xl border border-neutral-border px-5 text-sm font-bold text-neutral-text transition hover:bg-neutral-soft"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !startDate || !endDate || endDate < startDate}
                className="flex min-h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PeriodModal
