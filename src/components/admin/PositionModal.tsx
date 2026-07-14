import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2, Save } from 'lucide-react'
import CustomSelect from './CustomSelect'

const schema = z.object({
  position_name: z.string().min(3, 'Nama posisi minimal 3 karakter').max(100, 'Nama posisi maksimal 100 karakter'),
  status: z.enum(['active', 'inactive']),
})

export type PositionFormValues = z.infer<typeof schema>

interface Props {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: PositionFormValues) => void
  initialData?: PositionFormValues & { id?: number }
  isSubmitting: boolean
}

const PositionModal = ({ isOpen, onClose, onSubmit, initialData, isSubmitting }: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PositionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      position_name: '',
      status: 'active',
    },
  })

  const status = watch('status')

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          position_name: initialData.position_name,
          status: initialData.status,
        })
      } else {
        reset({ position_name: '', status: 'active' })
      }
    }
  }, [isOpen, initialData, reset])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-border px-6 py-4">
          <h2 className="text-lg font-extrabold text-neutral-text">
            {initialData ? 'Edit Posisi Magang' : 'Tambah Posisi Magang'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-neutral-muted transition hover:bg-neutral-bg hover:text-neutral-text"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col p-6">
          <div className="mb-4 flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-neutral-text">
              Nama Posisi <span className="text-red-500">*</span>
            </label>
            <input
              {...register('position_name')}
              placeholder="Contoh: Hukum Perdata, Administrasi"
              className="rounded-xl border border-neutral-border bg-neutral-bg px-4 py-2.5 text-sm font-semibold text-neutral-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.position_name && (
              <p className="text-xs text-red-500">{errors.position_name.message}</p>
            )}
          </div>

          <div className="mb-8 flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-neutral-text">
              Status <span className="text-red-500">*</span>
            </label>
            <input type="hidden" {...register('status')} />
            <CustomSelect
              fullWidth
              value={status}
              onChange={(value) => setValue('status', value as PositionFormValues['status'], { shouldDirty: true, shouldValidate: true })}
              options={[
                { value: 'active', label: 'Aktif' },
                { value: 'inactive', label: 'Tidak Aktif' },
              ]}
            />
            {errors.status && (
              <p className="text-xs text-red-500">{errors.status.message}</p>
            )}
            <p className="mt-1 text-xs text-neutral-muted">
              Posisi tidak aktif tidak akan muncul di form pendaftaran publik.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl px-4 py-2 text-sm font-bold text-neutral-subtle transition hover:bg-neutral-border disabled:opacity-50"
            >
              Batal
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-card transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PositionModal
