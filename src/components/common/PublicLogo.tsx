import logoMark from '../../assets/logo 1.svg'
import logoFull from '../../assets/logo 2.svg'

type PublicLogoProps = {
  variant?: 'full' | 'mark'
  className?: string
}

const PublicLogo = ({ variant = 'full', className = '' }: PublicLogoProps) => {
  const logo = variant === 'mark' ? logoMark : logoFull

  return (
    <img
      src={logo}
      alt="Ruang Magang Kementerian Hukum"
      className={className}
    />
  )
}

export default PublicLogo
