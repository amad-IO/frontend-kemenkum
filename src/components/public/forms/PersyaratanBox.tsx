import type { KategoriPersyaratan, PersyaratanItem } from '../../../services/daftarService'
import { CheckCircle2, FileText } from 'lucide-react'

interface Props {
  kategoriList: KategoriPersyaratan[]
  jenis: 'magang' | 'penelitian'
}

const PersyaratanBox = ({ kategoriList, jenis }: Props) => {
  return (
    <div className="flex flex-col gap-4">
      {kategoriList.map((kategori, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-neutral-border bg-neutral-card p-5 shadow-card"
        >
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <FileText size={16} className="text-primary" />
            </div>
            <h3 className="text-sm font-bold text-neutral-text">
              {kategori.kategori}
            </h3>
          </div>

          <ul className="flex flex-col gap-2">
            {kategori.items.map((item: PersyaratanItem, i: number) => (
              <li key={i} className="flex items-start gap-2.5">
                <CheckCircle2
                  size={15}
                  className="mt-0.5 shrink-0 text-primary/60"
                />
                <span className="text-sm leading-relaxed text-neutral-subtle">
                  {item.teks}
                  {item.opsional && (
                    <span className="ml-1.5 text-xs font-semibold italic text-neutral-muted">
                      – Opsional
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <p className="text-center text-xs text-neutral-muted">
        Persyaratan berlaku untuk pendaftaran{' '}
        <span className="font-semibold capitalize text-primary">{jenis}</span>
      </p>
    </div>
  )
}

export default PersyaratanBox
