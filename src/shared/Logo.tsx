import logoMark from '../assets/logo 1.svg'
import logoFull from '../assets/logo 2.svg'

type LogoProps = {
  variant?: 'full' | 'mark'
  className?: string
}

const Logo = ({ variant = 'full', className = '' }: LogoProps) => {
  const logo = variant === 'mark' ? logoMark : logoFull

  return (
    <img
      src={logo}
      alt="Ruang Magang Kementerian Hukum"
      className={className}
    />
  )
}

export default Logo
