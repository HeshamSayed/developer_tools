import { ReactNode } from 'react'

interface ProfessionalCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  gradient?: boolean
  padding?: 'sm' | 'md' | 'lg'
}

export default function ProfessionalCard({
  children,
  className = '',
  hover = true,
  gradient = false,
  padding = 'md',
}: ProfessionalCardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  const baseClasses = gradient
    ? 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900'
    : 'bg-white dark:bg-gray-800'

  const hoverClasses = hover
    ? 'hover:shadow-2xl hover:border-primary-300 dark:hover:border-primary-700 transform hover:scale-[1.02]'
    : ''

  return (
    <div
      className={`
        ${baseClasses}
        ${paddingClasses[padding]}
        ${hoverClasses}
        rounded-2xl
        border-2 border-gray-200 dark:border-gray-700
        shadow-lg
        transition-all duration-300
        ${className}
      `}
    >
      {children}
    </div>
  )
}
