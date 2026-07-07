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
      <div className="mx-auto max-w-[1460px] px-6 py-10 sm:px-10 lg:px-14 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.6fr_0.8fr] lg:items-start">
          <div>
            <PublicLogo className="h-auto w-52" />
            <p className="mt-5 max-w-xs text-sm font-medium leading-relaxed text-neutral-card/75">
              Ruang informasi dan pendaftaran program magang Kementerian Hukum
              wilayah Jawa Timur.
            </p>
          </div>

          <address className="grid gap-4 not-italic">
            <p className="flex items-start gap-3 text-sm leading-relaxed text-neutral-card/90 sm:text-base">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-card/10">
                <MapPin size={19} />
              </span>
              <span>
                Jl. Kayoon No.50-52, Embong Kaliasin, Kec. Genteng, Surabaya,
                Jawa Timur 60271
              </span>
            </p>
            <p className="flex items-center gap-3 text-sm leading-relaxed text-neutral-card/90 sm:text-base">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-card/10">
                <Phone size={19} />
              </span>
              <span>031-5340707 (Telp) 081-1335052 (Whatsapp)</span>
            </p>
            <p className="flex items-center gap-3 text-sm leading-relaxed text-neutral-card/90 sm:text-base">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-card/10">
                <Mail size={19} />
              </span>
              <a
                className="underline decoration-neutral-card/45 underline-offset-4 transition hover:text-secondary-light"
                href="mailto:kanwiljatim@kemenkum.go.id"
              >
                kanwiljatim@kemenkum.go.id
              </a>
            </p>
          </address>

          <div className="lg:justify-self-end">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.16em] text-secondary-light">
              Terhubung
            </p>
            <div className="flex flex-wrap items-center gap-3" aria-label="Media sosial">
              <a className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-card/20 bg-neutral-card/10 text-neutral-card transition hover:-translate-y-0.5 hover:bg-neutral-card hover:text-primary" href="/" aria-label="Facebook">
                <Share2 size={21} />
              </a>
              <a className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-card/20 bg-neutral-card/10 text-lg font-semibold text-neutral-card transition hover:-translate-y-0.5 hover:bg-neutral-card hover:text-primary" href="/" aria-label="X">
                <span aria-hidden="true">X</span>
              </a>
              <a className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-card/20 bg-neutral-card/10 text-neutral-card transition hover:-translate-y-0.5 hover:bg-neutral-card hover:text-primary" href="/" aria-label="Instagram">
                <AtSign size={21} />
              </a>
              <a className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-card/20 bg-neutral-card/10 text-neutral-card transition hover:-translate-y-0.5 hover:bg-neutral-card hover:text-primary" href="/" aria-label="TikTok">
                <Music2 size={21} />
              </a>
              <a className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-card/20 bg-neutral-card/10 text-neutral-card transition hover:-translate-y-0.5 hover:bg-neutral-card hover:text-primary" href="/" aria-label="YouTube">
                <CirclePlay size={23} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-neutral-card/14 pt-6 text-sm text-neutral-card/75 md:flex-row md:items-center md:justify-between">
          <p>Laman Resmi Kantor Wilayah Kementerian Hukum Provinsi Jawa Timur</p>
          <p>Copyright © 2026 Pusat Data dan Teknologi Informasi</p>
        </div>
      </div>
    </footer>
  )
}

export default PublicFooter
