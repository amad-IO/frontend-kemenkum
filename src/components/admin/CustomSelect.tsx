import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface Option {
  value: string
  label: string
}

interface CustomSelectProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  icon?: React.ReactNode
}

const CustomSelect = ({ options, value, onChange, icon }: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.value === value) || options[0]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex min-w-[140px] items-center justify-between gap-2 rounded-xl border border-neutral-border bg-white px-3 py-2.5 text-sm font-semibold text-neutral-text shadow-sm transition-all duration-200 hover:border-primary focus:border-primary focus:outline-none active:scale-[0.97]"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span>{selectedOption?.label}</span>
        </div>
        <ChevronDown size={14} className={`text-neutral-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <div 
        className={`absolute right-0 top-full z-50 mt-2 w-full min-w-max origin-top-right overflow-hidden rounded-xl border border-neutral-border bg-white py-1 shadow-lg transition-all duration-200 ${
          isOpen 
            ? 'visible translate-y-0 scale-100 opacity-100' 
            : 'invisible -translate-y-2 scale-95 opacity-0'
        }`}
      >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className={`flex w-full items-center px-4 py-2.5 text-left text-sm font-medium transition ${
                value === option.value 
                  ? 'bg-primary/10 text-primary font-bold' 
                  : 'text-neutral-text hover:bg-neutral-50 hover:text-primary'
              }`}
            >
              {option.label}
            </button>
          ))}
      </div>
    </div>
  )
}

export default CustomSelect
