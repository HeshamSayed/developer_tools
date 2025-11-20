import { ReactNode } from 'react'

interface ProfessionalSectionProps {
  children: ReactNode
  className?: string
  background?: 'white' | 'gray' | 'gradient' | 'primary' | 'transparent'
  padding?: 'sm' | 'md' | 'lg' | 'xl'
  container?: boolean
}

export default function ProfessionalSection({
  children,
  className = '',
  background = 'transparent',
  padding = 'lg',
  container = true,
}: ProfessionalSectionProps) {
  const backgrounds = {
    white: 'bg-white dark:bg-gray-900',
    gray: 'bg-gray-50 dark:bg-gray-800',
    gradient: 'bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800',
    primary: 'bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600',
    transparent: 'bg-transparent',
  }

  const paddings = {
    sm: 'py-8',
    md: 'py-12 sm:py-16',
    lg: 'py-16 sm:py-20 lg:py-24',
    xl: 'py-20 sm:py-24 lg:py-32',
  }

  return (
    <section className={`${backgrounds[background]} ${paddings[padding]} ${className}`}>
      {container ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
      ) : (
        children
      )}
    </section>
  )
}
