import { useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react'

interface DateRangePickerFieldProps {
  label: string
  startDate?: string
  endDate?: string
  onStartChange: (value: string) => void
  onEndChange: (value: string) => void
  startError?: string
  endError?: string
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

const DateRangePickerField = ({
  label,
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  startError,
  endError,
}: DateRangePickerFieldProps) => {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'start' | 'end'>('start')
  const [tempStart, setTempStart] = useState(startDate || '')
  const [tempEnd, setTempEnd] = useState(endDate || '')
  const [viewDate, setViewDate] = useState(parseDate(startDate || endDate))

  const hasError = Boolean(startError || endError)
  const activeValue = step === 'start' ? tempStart : tempEnd

  const monthDates = useMemo(() => {
    const firstDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
    const mondayOffset = (firstDate.getDay() + 6) % 7
    const start = addDays(firstDate, -mondayOffset)
    return Array.from({ length: 42 }, (_, index) => addDays(start, index))
  }, [viewDate])

  const openPicker = () => {
    setTempStart(startDate || '')
    setTempEnd(endDate || '')
    setStep('start')
    setViewDate(parseDate(startDate || endDate))
    setOpen(true)
  }

  const chooseDate = (date: Date) => {
    const value = toISODate(date)
    if (step === 'start') {
      setTempStart(value)
      if (tempEnd && tempEnd < value) setTempEnd('')
      setStep('end')
      return
    }
    if (tempStart && value < tempStart) {
      setTempStart(value)
      setTempEnd('')
      return
    }
    setTempEnd(value)
  }

  const goNext = () => {
    if (!tempStart) return
    setStep('end')
    setViewDate(parseDate(tempEnd || tempStart))
  }

  const confirmRange = () => {
    if (!tempStart || !tempEnd || tempEnd < tempStart) return
    onStartChange(tempStart)
    onEndChange(tempEnd)
    setOpen(false)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-neutral-text">
        {label} <span className="text-red-500">*</span>
      </label>

      <button
        type="button"
        onClick={openPicker}
        className={`flex min-h-14 w-full items-center gap-3 rounded-xl border bg-white px-4 text-left transition hover:border-primary hover:bg-primary/5 ${
          hasError ? 'border-red-300' : 'border-neutral-border'
        }`}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <CalendarDays size={20} />
        </span>
        <span className="min-w-0 flex-1">
          {startDate && endDate ? (
            <span className="block truncate text-sm font-bold text-neutral-text">
              {formatDate(startDate)} sampai {formatDate(endDate)}
            </span>
          ) : (
            <>
              <span className="block text-sm font-bold text-neutral-text">Pilih periode kegiatan</span>
              <span className="block text-xs text-neutral-muted">Tanggal mulai dan selesai</span>
            </>
          )}
        </span>
      </button>

      {startError && <p className="text-xs text-red-500">{startError}</p>}
      {endError && <p className="text-xs text-red-500">{endError}</p>}

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-neutral-text/40 px-3 py-4 sm:items-center">
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-neutral-border bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-border px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-neutral-border bg-neutral-soft text-primary">
                  <CalendarDays size={20} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-neutral-text">Pilih periode kegiatan</h3>
                  <p className="mt-0.5 text-sm text-neutral-subtle">
                    {step === 'start' ? 'Tentukan tanggal mulai terlebih dahulu.' : 'Tentukan tanggal berakhir, lalu konfirmasi.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-muted transition hover:bg-neutral-soft hover:text-neutral-text"
                aria-label="Tutup kalender"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid md:grid-cols-[1.12fr_0.88fr]">
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
                    const beforeStart = step === 'end' && tempStart && value < tempStart
                    const disabled = outOfMonth || Boolean(beforeStart)
                    const active = isSameDate(date, activeValue)
                    const rangeEdge = isSameDate(date, tempStart) || isSameDate(date, tempEnd)
                    const inRange = tempStart && tempEnd && value > tempStart && value < tempEnd
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
                        {tempStart ? formatDate(tempStart) : 'Pilih tanggal awal'}
                      </span>
                    </button>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-neutral-text">End date*</label>
                    <button
                      type="button"
                      onClick={() => tempStart && setStep('end')}
                      disabled={!tempStart}
                      className={`flex min-h-12 w-full items-center rounded-xl border bg-white text-left text-sm transition ${
                        step === 'end' ? 'border-primary ring-2 ring-primary/15' : 'border-neutral-border'
                      } disabled:cursor-not-allowed disabled:bg-neutral-soft disabled:text-neutral-muted`}
                    >
                      <span className="flex-1 px-4 font-semibold text-neutral-text">
                        {tempEnd ? formatDate(tempEnd) : 'Pilih tanggal berakhir'}
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-xl border border-neutral-border bg-neutral-soft px-4 py-3">
                    <span className="text-sm font-semibold text-neutral-text">Total durasi</span>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary">
                      {formatDuration(tempStart, tempEnd)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-neutral-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-neutral-muted">
                Periode:{' '}
                <span className="font-bold text-neutral-text">
                  {tempStart ? formatDate(tempStart) : '-'}
                  {tempEnd ? ` - ${formatDate(tempEnd)}` : ''}
                </span>
              </p>
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="min-h-11 rounded-xl border border-neutral-border px-5 text-sm font-bold text-neutral-text transition hover:bg-neutral-soft"
                >
                  Cancel
                </button>
                {step === 'start' ? (
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!tempStart}
                    className="min-h-11 rounded-xl bg-primary px-6 text-sm font-bold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    OK
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={confirmRange}
                    disabled={!tempStart || !tempEnd || tempEnd < tempStart}
                    className="min-h-11 rounded-xl bg-primary px-6 text-sm font-bold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Konfirmasi
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DateRangePickerField
