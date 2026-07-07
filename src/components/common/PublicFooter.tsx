import {
  AtSign,
  CirclePlay,
  Mail,
  MapPin,
  Music2,
  Phone,
  Share2,
} from 'lucide-react'
import PublicLogo from './PublicLogo'

const PublicFooter = () => {
  return (
    <footer className="bg-primary text-neutral-card">
      <div className="mx-auto max-w-[1460px] px-6 py-11 pb-16 sm:px-10 lg:px-14">
        <PublicLogo className="mb-11 h-auto w-52" />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <address className="grid gap-2.5 not-italic">
            <p className="flex items-center gap-3 text-[clamp(0.95rem,1.15vw,1.25rem)] text-neutral-card/90">
              <MapPin size={22} className="shrink-0" />
              <span>
                Jl. Kayoon No.50-52, Embong Kaliasin, Kec. Genteng, Surabaya,
                Jawa Timur 60271
              </span>
            </p>
            <p className="flex items-center gap-3 text-[clamp(0.95rem,1.15vw,1.25rem)] text-neutral-card/90">
              <Phone size={22} className="shrink-0" />
              <span>031-5340707 (Telp) 081-1335052 (Whatsapp)</span>
            </p>
            <p className="flex items-center gap-3 text-[clamp(0.95rem,1.15vw,1.25rem)] text-neutral-card/90">
              <Mail size={22} className="shrink-0" />
              <a className="underline" href="mailto:kanwiljatim@kemenkum.go.id">
                kanwiljatim@kemenkum.go.id
              </a>
            </p>
          </address>

          <div className="flex items-center gap-7" aria-label="Media sosial">
            <a className="inline-flex text-neutral-card" href="/" aria-label="Facebook">
              <Share2 size={28} />
            </a>
            <a className="inline-flex text-2xl font-medium text-neutral-card" href="/" aria-label="X">
              <span aria-hidden="true">X</span>
            </a>
            <a className="inline-flex text-neutral-card" href="/" aria-label="Instagram">
              <AtSign size={28} />
            </a>
            <a className="inline-flex text-neutral-card" href="/" aria-label="TikTok">
              <Music2 size={28} />
            </a>
            <a className="inline-flex text-neutral-card" href="/" aria-label="YouTube">
              <CirclePlay size={30} />
            </a>
          </div>
        </div>

        <div className="mt-12 text-center text-[clamp(0.95rem,1.12vw,1.22rem)] leading-relaxed text-neutral-card/90">
          <p>Laman Resmi</p>
          <p>Kantor Wilayah Kementerian Hukum</p>
          <p>Provinsi Jawa Timur</p>
          <p>Copyright © 2026 Pusat Data dan Teknologi Informasi</p>
        </div>
      </div>
    </footer>
  )
}

export default PublicFooter
