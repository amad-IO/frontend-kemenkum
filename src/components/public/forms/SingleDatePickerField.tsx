import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react'

interface SingleDatePickerFieldProps {
  value?: string
  onChange: (value: string) => void
  hasError?: boolean
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

const formatDate = (value?: string) => value
  ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(parseDate(value))
  : ''

const SingleDatePickerField = ({ value = '', onChange, hasError = false }: SingleDatePickerFieldProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [selectedDate, setSelectedDate] = useState(value)
  const [viewDate, setViewDate] = useState(parseDate(value))

  const monthDates = useMemo(() => {
    const firstDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
    const mondayOffset = (firstDate.getDay() + 6) % 7
    const start = addDays(firstDate, -mondayOffset)
    return Array.from({ length: 42 }, (_, index) => addDays(start, index))
  }, [viewDate])

  const openPicker = () => {
    setIsClosing(false)
    setSelectedDate(value)
    setViewDate(parseDate(value))
    setIsOpen(true)
  }

  const closePicker = (saveDate = false) => {
    if (isClosing) return
    setIsClosing(true)
    window.setTimeout(() => {
      if (saveDate && selectedDate) onChange(selectedDate)
      setIsOpen(false)
      setIsClosing(false)
    }, 180)
  }

  return (
    <>
      <button
        type="button"
        onClick={openPicker}
        className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border-2 bg-white px-4 text-left text-sm transition-all hover:border-primary/60 ${
          hasError ? 'border-red-300' : 'border-neutral-200'
        }`}
      >
        <span className={value ? 'font-semibold text-neutral-text' : 'text-neutral-muted'}>
          {value ? formatDate(value) : 'Pilih tanggal surat'}
        </span>
        <CalendarDays size={18} className="shrink-0 text-primary" />
      </button>

      {isOpen && createPortal(
        <div className={`${isClosing ? 'date-picker-backdrop-exit' : 'date-picker-backdrop-enter'} fixed inset-0 z-[9999] flex items-end justify-center bg-neutral-text/15 p-3 sm:items-center`}>
          <div className={`${isClosing ? 'date-picker-popup-exit' : 'date-picker-popup-enter'} w-full max-w-sm overflow-hidden rounded-xl border border-neutral-border bg-white shadow-md`}>
            <div className="flex items-center justify-between border-b border-neutral-border px-3.5 py-2.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-border bg-neutral-soft text-primary">
                  <CalendarDays size={16} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-neutral-text">Pilih tanggal surat permohonan</h3>
                  <p className="mt-0.5 text-[11px] text-neutral-subtle">Tentukan tanggal yang tercantum pada surat.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => closePicker()}
                className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-muted transition hover:bg-neutral-soft"
                aria-label="Tutup kalender"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-3">
              <div className="mb-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setViewDate(addMonths(viewDate, -1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-muted transition hover:bg-neutral-soft hover:text-primary"
                  aria-label="Bulan sebelumnya"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-bold text-neutral-text">
                  {new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(viewDate)}
                </span>
                <button
                  type="button"
                  onClick={() => setViewDate(addMonths(viewDate, 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-muted transition hover:bg-neutral-soft hover:text-primary"
                  aria-label="Bulan berikutnya"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-y-0.5">
                {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => (
                  <span key={day} className="py-1 text-center text-[11px] font-bold text-neutral-muted">{day}</span>
                ))}
                {monthDates.map((date) => {
                  const dateValue = toISODate(date)
                  const isSelected = selectedDate === dateValue
                  const outOfMonth = date.getMonth() !== viewDate.getMonth()
                  return (
                    <button
                      key={dateValue}
                      type="button"
                      disabled={outOfMonth}
                      onClick={() => setSelectedDate(dateValue)}
                      className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${
                        isSelected
                          ? 'bg-primary text-white shadow-card'
                          : 'text-neutral-text hover:bg-neutral-soft hover:text-primary'
                      } disabled:cursor-default disabled:text-neutral-muted/35 disabled:hover:bg-transparent`}
                    >
                      {date.getDate()}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-neutral-border px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-neutral-muted">
                Tanggal: <span className="font-bold text-neutral-text">{selectedDate ? formatDate(selectedDate) : '-'}</span>
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => closePicker()}
                  className="min-h-9 flex-1 rounded-lg border border-neutral-border px-4 text-xs font-bold text-neutral-text transition hover:bg-neutral-soft sm:flex-none"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedDate}
                  onClick={() => closePicker(true)}
                  className="min-h-9 flex-1 rounded-lg bg-primary px-5 text-xs font-bold text-white transition hover:bg-primary-dark disabled:opacity-50 sm:flex-none"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}

export default SingleDatePickerField
