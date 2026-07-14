import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { EDUCATION_LEVELS } from '../../../data/indonesiaCities'

interface EducationLevelSelectProps {
  value?: string
  onChange: (value: (typeof EDUCATION_LEVELS)[number]) => void
  hasError?: boolean
}

const EducationLevelSelect = ({ value = '', onChange, hasError = false }: EducationLevelSelectProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [])

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border-2 bg-white px-4 text-left text-sm transition-all duration-200 hover:border-primary/60 ${
          hasError
            ? 'border-red-300'
            : isOpen
              ? 'border-primary ring-4 ring-primary/10'
              : 'border-neutral-200'
        }`}
      >
        <span className={value ? 'font-semibold text-neutral-text' : 'text-neutral-muted'}>
          {value || 'Pilih jenjang pendidikan'}
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-primary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-xl">
          {EDUCATION_LEVELS.map((level) => {
            const isSelected = value === level
            return (
              <button
                key={level}
                type="button"
                onClick={() => {
                  onChange(level)
                  setIsOpen(false)
                }}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors ${
                  isSelected
                    ? 'bg-primary text-white'
                    : 'text-neutral-text hover:bg-primary/10 hover:text-primary'
                }`}
              >
                {level}
                {isSelected && <Check size={16} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default EducationLevelSelect
