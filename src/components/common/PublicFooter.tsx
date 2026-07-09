import { Mail, MapPin, Phone } from 'lucide-react'
import PublicLogo from './PublicLogo'

type IconProps = React.SVGProps<SVGSVGElement>

const FacebookIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M13.5 21v-8.15h2.73l.41-3.17h-3.14V7.7c0-.92.25-1.54 1.57-1.54h1.68V3.32C15.98 3.22 15.03 3 13.93 3c-2.3 0-3.87 1.4-3.87 3.98v2.7H7.32v3.17h2.74V21h3.44z" />
  </svg>
)

const XIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M13.6 10.6 20.4 3h-1.6l-5.9 6.6L8.2 3H3l7.1 9.9L3 21h1.6l6.2-7 5 7H21l-7.4-10.4Zm-2.2 2.5-.7-1L5 4.3h2.1l4.6 6.4.7 1 6 8.4h-2.1l-4.9-6.6Z" />
  </svg>
)

const InstagramIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4.2" />
    <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
  </svg>
)

const TikTokIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M16.6 3c.35 2.1 1.7 3.75 3.9 4.05v2.75c-1.35.06-2.6-.35-3.9-1.2v6.3c0 3.2-2.5 5.6-5.6 5.6-1.4 0-2.75-.5-3.8-1.45a5.6 5.6 0 0 1-1.8-4.15c0-3.1 2.5-5.6 5.6-5.6.35 0 .7.03 1.03.1v2.85a2.7 2.7 0 0 0-1.03-.2 2.8 2.8 0 1 0 2.8 2.8V3h2.8z" />
  </svg>
)

const YouTubeIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M21.6 7.2s-.2-1.5-.85-2.15c-.8-.85-1.7-.85-2.1-.9C15.9 4 12 4 12 4h-.02s-3.9 0-6.65.15c-.4.05-1.3.05-2.1.9C2.6 5.7 2.4 7.2 2.4 7.2S2.2 9 2.2 10.75v1.5c0 1.75.2 3.55.2 3.55s.2 1.5.85 2.15c.8.85 1.85.82 2.32.92 1.68.16 6.43.2 6.43.2s3.9 0 6.65-.15c.4-.05 1.3-.05 2.1-.9.65-.65.85-2.15.85-2.15s.2-1.8.2-3.55v-1.5c0-1.75-.2-3.55-.2-3.55zM9.95 14.6V8.9l5.4 2.85-5.4 2.85z" />
  </svg>
)

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

          {/* Sektor Kontak Alamat */}
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
          </address> {/* <-- DI SINI: Ditambahkan tag penutup yang tadi hilang */}

          {/* Sektor Sosial Media */}
          <div className="lg:justify-self-end">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.16em] text-secondary-light">
              Terhubung
            </p>
            <div className="flex flex-wrap items-center gap-3" aria-label="Media sosial">
              <a className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-card/20 bg-neutral-card/10 text-neutral-card transition hover:-translate-y-0.5 hover:bg-neutral-card hover:text-primary" href="https://www.facebook.com/people/Kanwil-Kemenkum-Jawa-Timur/61574871164838/" aria-label="Facebook">
                <FacebookIcon className="h-[19px] w-[19px]" />
              </a>
              <a className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-card/20 bg-neutral-card/10 text-neutral-card transition hover:-translate-y-0.5 hover:bg-neutral-card hover:text-primary" href="https://x.com/kemenkumjatim?t=y0oGoGwKUCNoqz6-ztbmng&s=08" aria-label="X">
                <XIcon className="h-[18px] w-[18px]" />
              </a>
              <a className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-card/20 bg-neutral-card/10 text-neutral-card transition hover:-translate-y-0.5 hover:bg-neutral-card hover:text-primary" href="https://www.instagram.com/kemenkumjatim?igsh=OGlnem5vMDdiZnAx" aria-label="Instagram">
                <InstagramIcon className="h-[20px] w-[20px]" />
              </a>
              <a className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-card/20 bg-neutral-card/10 text-neutral-card transition hover:-translate-y-0.5 hover:bg-neutral-card hover:text-primary" href="https://www.tiktok.com/@kemenkumjatim?_t=ZS-8toj9UxIoo3&_r=1" aria-label="TikTok">
                <TikTokIcon className="h-[19px] w-[19px]" />
              </a>
              <a className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-card/20 bg-neutral-card/10 text-neutral-card transition hover:-translate-y-0.5 hover:bg-neutral-card hover:text-primary" href="https://www.youtube.com/@kemenkumjatim" aria-label="YouTube">
                <YouTubeIcon className="h-[21px] w-[21px]" />
              </a>
            </div>
          </div>
        </div>

        {/* Garis batas dan Hak Cipta */}
        <div className="mt-10 flex flex-col gap-3 border-t border-neutral-card/14 pt-6 text-sm text-neutral-card/75 md:flex-row md:items-center md:justify-between">
          <p>Laman Resmi Kantor Wilayah Kementerian Hukum Provinsi Jawa Timur</p>
          <p>Copyright © 2026 Pusat Data dan Teknologi Informasi</p>
        </div>
      </div>
    </footer>
  )
}

export default PublicFooter