import React from 'react'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'text'
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  ...props
}: SkeletonProps) {
  // Base classes for the shimmer effect
  const baseClasses =
    'animate-shimmer bg-[linear-gradient(90deg,var(--tw-gradient-stops))] from-neutral-bg via-white/60 to-neutral-bg bg-[length:200%_100%]'

  // Variant classes
  const variantClasses = {
    rectangular: 'rounded-xl',
    circular: 'rounded-full',
    text: 'rounded-md',
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
}
