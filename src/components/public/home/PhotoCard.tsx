interface PhotoCardProps {
  imageSrc: string
  imageAlt?: string
  caption?: string
  className?: string
}

const PhotoCard = ({
  imageSrc,
  imageAlt = 'Photo',
  caption = 'Buka potensi Anda dan rasakan pengalaman kerja profesional bersama Kementerian Hukum.',
  className = '',
}: PhotoCardProps) => {
  return (
    <div
      className={`
        inline-flex flex-col
        bg-white
        rounded-[28px]
        shadow-[0_8px_40px_rgba(0,0,0,0.10)]
        p-3
        max-w-[250px]
        sm:max-w-[340px]
        w-full
        ${className}
      `}
    >
      <div className="overflow-hidden rounded-[20px] w-full">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-[270px] object-cover block"
        />
      </div>

      <p
        className="
          text-center
          italic
          text-[#6E473B]
          text-[0.78rem]
          leading-[1.55]
          px-4
          pt-4
          pb-2
          font-medium
        "
      >
        {caption}
      </p>
    </div>
  )
}

export default PhotoCard
