import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { INDONESIA_REGENCIES } from '../../../data/indonesiaCities'

interface RegencyComboboxProps {
  value?: string
  onChange: (value: string) => void
  hasError?: boolean
}

const RegencyCombobox = ({ value = '', onChange, hasError = false }: RegencyComboboxProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState(value)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => setQuery(value), [value])

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [])

  const options = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('id')
    return INDONESIA_REGENCIES
      .filter((area) => !normalizedQuery || area.name.toLocaleLowerCase('id').startsWith(normalizedQuery))
      .slice(0, 8)
  }, [query])

  return (
    <div ref={wrapperRef} className="relative">
      <input
        value={query}
        autoComplete="off"
        placeholder="Ketik atau pilih kabupaten/kota"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        className={`input-field pr-10 ${hasError ? 'border-red-300' : ''}`}
        onFocus={() => setIsOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value)
          onChange('')
          setIsOpen(true)
        }}
      />
      <button
        type="button"
        aria-label="Buka pilihan kabupaten atau kota"
        onClick={() => setIsOpen((open) => !open)}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-neutral-muted"
      >
        <ChevronDown size={18} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-xl">
          {options.length > 0 ? (
            options.map((area) => (
              <button
                key={area.code}
                type="button"
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors ${
                  value === area.name
                    ? 'bg-primary text-white'
                    : 'text-neutral-text hover:bg-primary/10 hover:text-primary'
                }`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setQuery(area.name)
                  onChange(area.name)
                  setIsOpen(false)
                }}
              >
                {area.name}
                {value === area.name && <Check size={16} className="ml-3 shrink-0" />}
              </button>
            ))
          ) : (
            <p className="px-4 py-3 text-sm text-neutral-muted">Kabupaten/kota tidak ditemukan</p>
          )}
        </div>
      )}
    </div>
  )
}

export default RegencyCombobox
